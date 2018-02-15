# DIG DIG JOY DIG JOY PO POY

## What is it?

Know ```$ dig```? So, we do the same, but through and API.

## How to use?

GET to `https://digdigjoydigjoypopoy.herokuapp.com/dig` with `domain` and `type` as 
query string parameters.

It will return a JSON with `'status'` (which can be *'OK'* or *'ERROR'*) and
another property, which can be *'description'* if status is ERROR and 
*'records'* is OK.

## Health check

If you're seeing this, everything is OK. But you can constantly make request to
`https://digdigjoydigjoypopoy.herokuapp.com/status` and we'll return a JSON 
like this:

```json
    {"status":"OK"}
```

OR like this:

```json
    {"status":"ERROR"}
```

## Example

```
curl https://digdigjoydigjoypopoy.herokuapp.com/dig?domain=quagliato.me&type=A
```

## Get in touch

E-mail me at [eduardo@quagliato.me](mailto:eduardo@quagliato.me)
