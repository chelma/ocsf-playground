# OCSF Normalization Playground

This package contains the work-in-progress code for the OCSF Normalization Playground, a way for developers and security engineers to rapidly create and test transformations that convert log or data entries into an equivalent OCSF-compliant JSON blob.

### Running the code

#### Backend
To run the backend code locally, use a Python virtual environment.  You'll need AWS Credentials in your AWS Keyring, permissions to invoke Bedrock, and to have onboarded your account to use Claude 3.5 Sonnet (`anthropic.claude-3-5-sonnet-20240620-v1:0`) in `us-west-2`.

```bash
# Start in the repo root

python3 -m venv venv
source venv/bin/activate
pipenv sync --dev

(cd playground && python3 manage.py runserver)
```

This will start a Django REST Framework API running at `http://127.0.0.1:8000`.

You can then hit the API to generate a transform for an Elasticsearch 6.8 Index Settings JSON to OpenSearch 2.17 like so:

```bash
curl -X POST "http://127.0.0.1:8000/transformer/heuristic/create/" -H "Content-Type: application/json" -d '
{
    "input_entry": "Thu Mar 12 2025 07:40:57 mailsv1 sshd[4351]: Failed password for invalid user guest from 86.212.199.60 port 3771 ssh2"
}'
{"new_heuristic":"^[A-Z][a-z]{2} [A-Z][a-z]{2} \\d{2} \\d{4} \\d{2}:\\d{2}:\\d{2} \\w+ sshd\\[\\d+\\]: Failed password for invalid user \\w+ from \\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3} port \\d+ ssh2$","rationale":"This regex is designed to match SSH failed login attempts for invalid users, as shown in the input entry. Here's a breakdown of the regex and its rationale:\n\n1. ^[A-Z][a-z]{2} [A-Z][a-z]{2} \\d{2} \\d{4} \\d{2}:\\d{2}:\\d{2}: Matches the timestamp at the beginning of the line. It assumes a consistent format of \"Day Month DD YYYY HH:MM:SS\".\n\n2. \\w+: Matches the hostname (mailsv1 in the example).\n\n3. sshd\\[\\d+\\]: Matches \"sshd\" followed by a process ID in square brackets.\n\n4. Failed password for invalid user \\w+: Matches the specific error message, allowing for any username.\n\n5. from \\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}: Matches an IPv4 address.\n\n6. port \\d+ ssh2$: Matches the port number and \"ssh2\" at the end of the line.\n\nThis regex is specific enough to match similar SSH failed login attempts for invalid users while excluding other types of log entries. It balances specificity and flexibility by allowing for different usernames, IP addresses, and port numbers.\n\nThe regex adheres to JavaScript RegExp specifications and doesn't use any prohibited features like lookaheads, lookbehinds, backreferences, or recursion. It's designed to be efficient and straightforward, matching the structure of the log entry without over-complicating the pattern.\n\nNo specific user guidance was provided, so the regex was created based on the general guidelines and the input entry's structure."}


curl -X POST "http://127.0.0.1:8000/transformer/categorize/v1_1_0/" -H "Content-Type: application/json" -d '
{
    "input_entry": "Thu Mar 12 2025 07:40:57 mailsv1 sshd[4351]: Failed password for invalid user guest from 86.212.199.60 port 3771 ssh2"
}'
{"ocsf_category":"Authentication","ocsf_version":"1.1.0","rationale":"The input entry \"Thu Mar 12 2025 07:40:57 mailsv1 sshd[4351]: Failed password for invalid user guest from 86.212.199.60 port 3771 ssh2\" clearly represents an authentication event. Specifically, it's a failed login attempt via SSH. This aligns with the Authentication category (ID: 3002) which covers \"events related to authentication session activities such as user logon and logoff attempts.\" The entry includes details about a failed password attempt, an invalid user, and the source IP and port, which are typical elements of an authentication log. Additionally, the mention of \"ssh2\" indicates that this is an SSH-related authentication event, which is explicitly mentioned in the category description."}
```

#### Frontend

If you changed the Backend API specification, you'll first need to generate new client code.  The Backend uses `drf-spectacular` to auto-supply OpenAPI specs to facilitate this process.  You can generate the new client code like so:

```bash
# Start in the repo root

(cd playground && python3 manage.py spectacular --file schema.json)

(cd playground_frontend && npm install && npm run generate-api-client)
```

To run the Frontend, first start the Backend and ensure it's running.  Then, execute the following commands:

```bash
# Start in the repo root

(cd playground_frontend && npm install && npm run dev)
```

You should then be able to hit the Playground website in your web browser at `http://localhost:3000`.  The GUI should be pretty self-explanatory.

Here's some example input logs from RHEL `/var/log/secure`:
```
Thu Mar 12 2025 07:40:57 mailsv1 sshd[4351]: Failed password for invalid user guest from 86.212.199.60 port 3771 ssh2
Thu Mar 12 2025 07:40:57 mailsv1 sshd[2716]: Failed password for invalid user postgres from 86.212.199.60 port 4093 ssh2
Thu Mar 12 2025 07:40:57 mailsv1 sshd[2596]: Failed password for invalid user whois from 86.212.199.60 port 3311 ssh2
Thu Mar 12 2025 07:40:57 mailsv1 sshd[24947]: pam_unix(sshd:session): session opened for user djohnson by (uid=0)
Thu Mar 12 2025 07:40:57 mailsv1 sshd[3006]: Failed password for invalid user info from 86.212.199.60 port 4078 ssh2
Thu Mar 12 2025 07:40:57 mailsv1 sshd[5298]: Failed password for invalid user postgres from 86.212.199.60 port 1265 ssh2
Thu Mar 12 2025 07:40:57 mailsv1 sshd[5196]: Failed password for invalid user irc from 86.212.199.60 port 1454 ssh2
Thu Mar 12 2025 07:40:57 mailsv1 sshd[4472]: Failed password for invalid user vpxuser from 86.212.199.60 port 4203 ssh2
Thu Mar 12 2025 07:40:57 mailsv1 sshd[63551]: pam_unix(sshd:session): session opened for user djohnson by (uid=0)
Thu Mar 12 2025 07:40:57 mailsv1 sshd[5237]: Failed password for surly from 86.212.199.60 port 3734 ssh2
Thu Mar 12 2025 07:40:57 mailsv1 sshd[5737]: Failed password for invalid user mysql from 175.44.1.172 port 4073 ssh2
Thu Mar 12 2025 07:40:57 mailsv1 sshd[4508]: Failed password for invalid user services from 175.44.1.172 port 3288 ssh2
Thu Mar 12 2025 07:40:57 mailsv1 sshd[1254]: Failed password for invalid user testing from 175.44.1.172 port 1361 ssh2
Thu Mar 12 2025 07:40:57 mailsv1 sshd[46748]: Received disconnect from 10.3.10.46 11: disconnected by user
Thu Mar 12 2025 07:40:57 mailsv1 sshd[5730]: Failed password for invalid user admin from 175.44.1.172 port 4512 ssh2
Thu Mar 12 2025 07:40:57 mailsv1 sshd[3202]: Failed password for invalid user noone from 175.44.1.172 port 2394 ssh2
Thu Mar 12 2025 07:40:57 mailsv1 sshd[5555]: Failed password for invalid user noone from 175.44.1.172 port 2326 ssh2
Thu Mar 12 2025 07:40:57 mailsv1 sshd[1258]: Failed password for invalid user web002 from 175.44.1.172 port 4851 ssh2
Thu Mar 12 2025 07:40:57 mailsv1 sshd[12190]: pam_unix(sshd:session): session opened for user djohnson by (uid=0)
Thu Mar 12 2025 07:40:57 mailsv1 sshd[5240]: Failed password for invalid user sys from 175.44.1.172 port 1317 ssh2
Thu Mar 12 2025 07:40:57 mailsv1 sshd[4814]: Failed password for backup from 175.44.1.172 port 2985 ssh2
Thu Mar 12 2025 07:40:57 mailsv1 sshd[5267]: Failed password for invalid user library from 175.44.1.172 port 4666 ssh2
Thu Mar 12 2025 07:40:57 mailsv1 sshd[5535]: Failed password for invalid user mailman from 175.44.1.172 port 3188 ssh2
Thu Mar 12 2025 07:40:57 mailsv1 sshd[2581]: Failed password for root from 233.77.49.94 port 3670 ssh2
Thu Mar 12 2025 07:40:57 mailsv1 sshd[3757]: Failed password for invalid user administrator from 233.77.49.94 port 4139 ssh2
Thu Mar 12 2025 07:40:57 mailsv1 sshd[5309]: Failed password for squid from 233.77.49.94 port 1971 ssh2
Thu Mar 12 2025 07:40:57 mailsv1 sshd[5906]: Failed password for daemon from 91.205.40.22 port 2835 ssh2
Thu Mar 12 2025 07:40:57 mailsv1 sshd[4372]: Failed password for invalid user mongodb from 91.205.40.22 port 3568 ssh2
Thu Mar 12 2025 07:40:57 mailsv1 sshd[4472]: Failed password for invalid user ben from 91.205.40.22 port 3525 ssh2
Thu Mar 12 2025 07:40:57 mailsv1 sshd[95201]: Accepted password for nsharpe from 10.2.10.163 port 1211 ssh2
Thu Mar 12 2025 07:40:57 mailsv1 sshd[4117]: Failed password for invalid user email from 91.205.40.22 port 2790 ssh2
Thu Mar 12 2025 07:40:57 mailsv1 sshd[5937]: Failed password for invalid user yp from 91.205.40.22 port 4178 ssh2
Thu Mar 12 2025 07:40:57 mailsv1 sshd[3914]: Failed password for games from 91.205.40.22 port 2712 ssh2
Thu Mar 12 2025 07:40:57 mailsv1 sshd[3531]: Failed password for invalid user dba from 91.205.40.22 port 4907 ssh2
Thu Mar 12 2025 07:40:57 mailsv1 sshd[1552]: Failed password for invalid user mailman from 125.7.55.180 port 1095 ssh2
Thu Mar 12 2025 07:40:57 mailsv1 sshd[3451]: Failed password for invalid user email from 125.7.55.180 port 2392 ssh2
Thu Mar 12 2025 07:40:57 mailsv1 sshd[3497]: Failed password for invalid user irc from 125.7.55.180 port 1256 ssh2
Thu Mar 12 2025 07:40:57 mailsv1 su: pam_unix(su:session): session closed for user root
```


### Dependencies
`pipenv` is used to managed dependencies within the project.  The `Pipefile` and `Pipefile.lock` handle the local environment.  You can add dependencies like so:

```
pipenv install boto3
```

This updates the `Pipfile`/`Pipfile.lock` with the new dependency.  To create a local copy of the dependencies, such as for bundling a distribution, you can use pip like so:

```
pipenv requirements > requirements.txt
python3 -m pip install -r requirements.txt -t ./package --upgrade

zip -r9 playground.zip tools/ package/
```