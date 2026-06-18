import urllib.request
import urllib.error
import json

try:
    data = b'{"email":"vu.dang@gmail.com","password":"12345678"}'
    req = urllib.request.Request('http://localhost:8080/api/v1/auth/login', data=data, headers={'Content-Type': 'application/json'}, method='POST')
    res = urllib.request.urlopen(req)
    token = json.loads(res.read())['data']['accessToken']
    
    req2 = urllib.request.Request('http://localhost:8080/api/v1/courses/1', headers={'Authorization': 'Bearer ' + token})
    res2 = urllib.request.urlopen(req2)
    print(res2.read())
except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}: {e.read()}")
except Exception as e:
    print(e)
