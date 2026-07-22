import urllib.request
import urllib.parse

data = b'---------------------------123\r\nContent-Disposition: form-data; name="file"; filename="test.txt"\r\n\r\nHello\r\n---------------------------123\r\nContent-Disposition: form-data; name="file"; filename="test2.txt"\r\n\r\nWorld\r\n---------------------------123--\r\n'

req = urllib.request.Request('http://127.0.0.1:5000/upload', data=data, headers={'Content-Type': 'multipart/form-data; boundary=---------------------------123'})
try:
    print(urllib.request.urlopen(req).read().decode())
except Exception as e:
    print(e.read().decode())
