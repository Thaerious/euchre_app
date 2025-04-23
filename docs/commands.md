# transpile style sheets
npx sass <input>:<output>
npx sass -w app/static/sass/:app/static/css &

# lint the files
npx eslint .

# start the server
python app/server/app.py

# create new accounts database
rm accounts.db
euchre_app/app> sqlite3 accounts.db < sql/accounts.sql

# manipuate database
python ./server/SQLAccounts.py <method_name> [args...]
python ./server/SQLAccounts.py help

# installing local python project
pip install -e /home/ed/trunk/python/euchre_project
pip install --upgrade --force-reinstall /home/ed/trunk/python/euchre_project