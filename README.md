# DIG DIG JOY DIG JOY PO POY

## What is it?

Do you know the unix software ```$ dig```? So, we do the same, but with HTTP
requests.

## How to use?

Request an POST to digdigjoydigjoypopoy.com with a JSON that contains a domain
and a type, like this: 

```{\"domain\":\"digdigjoydigjoypopoy.com\", \"type\":\"NS\"}```

It will return a JSON with \"status\" (which can be \"OK\" or \"ERROR\") and
another property, which can be \"description\" if status is ERROR and \"records\"
 is OK

## Status
If you're seeing this, everything is OK. But you make a GET request to
http://pdf4devs.quagliato.me/status and we'll return a JSON like this
```
{"status":"OK"}
```
OR like this
```
{"status":"ERROR"}
```
## Example

```$ curl -XPOST digdigjoydigjoypopoy.com -d'{\"domain\":\"digdigjoydigjoypopoy.com\", \"type\":\"NS\"}'```

## Get in touch

E-mail me at [eduardo@quagliato.me](mailto:eduardo@quagliato.me)
