from app import app
import io

client = app.test_client()
data = {
    'file': [
        (io.BytesIO(b"Hello world file 1"), 'test1.txt'),
        (io.BytesIO(b"Hello world file 2"), 'test2.txt')
    ]
}

response = client.post('/upload', data=data, content_type='multipart/form-data')
print("Status:", response.status_code)
print(response.get_json())
