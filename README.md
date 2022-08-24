# tokenpack

- letus

```bash
curl -X POST -d 'username=xxxxxxxxxxx' -d 'password=xxxxxxxxxxx' http://localhost:3000/api/tus/letus/session
curl -X POST -d 'username=xxxxxxxxxxx' -d 'password=xxxxxxxxxxx' https://tokenpack.vercel.app/api/tus/letus/session
```

```json
{
    "MoodleSession2022": "xxxxxxxxxxxxxxxx"
}
```

- twins

```bash
curl -X POST -d 'username=xxxxxxxxxxx' -d 'password=xxxxxxxxxxx' http://localhost:3000/api/tsukuba/twins/session
curl -X POST -d 'username=xxxxxxxxxxx' -d 'password=xxxxxxxxxxx' https://tokenpack.vercel.app/api/tsukuba/twins/session
```

```json
{
    "campus-twins": "xxxxxxxxxxxxxxx",
    "JSESSIONID": "xxxxxxxxxxxxxxx",
}
```
