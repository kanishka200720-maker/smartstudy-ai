import requests

files = [
    ('file', ('sample1.txt', b'This is sample one text.', 'text/plain')),
    ('file', ('sample2.txt', b'This is sample two text.', 'text/plain'))
]

response = requests.post('http://127.0.0.1:5000/upload', files=files)
print("Status:", response.status_code)
print(response.text)
