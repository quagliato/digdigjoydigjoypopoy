# DIG DIG JOY DIG JOY PO POY

## How to use?

Request an POST to digdigjoydigjoypopoy.com with a JSON that contains a domain
and a type, like this: ```{\"domain\":\"digdigjoydigjoypopoy.com\", \"type\":\"NS\"}```

It will return a JSON with \"status\" (which can be \"OK\" or \"ERROR\") and
another property, which can be \"description\" if status is ERROR and \"records\"
if status is OK

eg:
```$ curl -XPOST digdigjoydigjoypopoy.com -d'{\"domain\":\"digdigjoydigjoypopoy.com\", \"type\":\"NS\"}'```

******************************************************************************/

