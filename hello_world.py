import subprocess
import atexit
from uuid import uuid1
from flask import Flask, request
from datetime import datetime
from flask_cors import CORS, cross_origin
import fcntl
import os
import threading
import time


app = Flask(__name__)
CORS(app)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['CORS_HEADERS'] = 'Content-Type'

Clients = {}
Times = {}

def setNonBlocking(fd):
    """
    Set the file description of the given file descriptor to non-blocking.
    """
    flags = fcntl.fcntl(fd, fcntl.F_GETFL)
    flags = flags | os.O_NONBLOCK
    fcntl.fcntl(fd, fcntl.F_SETFL, flags)

def new_process():
    return subprocess.Popen(['/Users/richard/work/cockroach-v19.2.2.darwin-10.9-amd64/cockroach','demo','movr'], stdout=subprocess.PIPE, stdin=subprocess.PIPE, stderr=subprocess.STDOUT)

@app.route('/new_client')
@cross_origin(origin='localhost',headers=['Content- Type','Authorization'])
def new_client():
    key = str(uuid1())
    Clients[key] = new_process()
    Times[key] = datetime.now()
    return key

@app.route('/client/<key>/send_input', methods=['POST'])
@cross_origin(origin='localhost',headers=['Content- Type','Authorization'])
def send_input(key):
    if key not in Clients:
        return 'Client not found', 404

    cmd = request.get_data()
    print("CMD IS "+str(cmd, 'utf-8'))

    
    process = Clients[key]
    
    process.stdout.flush()
    
    setNonBlocking(process.stdin)
    setNonBlocking(process.stdout)
    
    process.stdin.write(cmd + b"\n")
    process.stdin.flush()
    time.sleep(0.25)
    
    output = process.stdout.read()
    
    if not output:
        return "err"
    
    return output
    
def gc():
    for key in Clients:
        if (datetetime.now()-Times[key]).total_seconds() > 20*60:
            Clients[key].terminate()
            del Clients[key]
            del Times[key]


def close_all():
    for proc in Clients.values():
        proc.terminate()

atexit.register(close_all)

# app.run(host='0.0.0.0')