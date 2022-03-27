# :bar_chart: url-monitor
----
A RESTful API server that allows authenticated users to monitor URLs, and get detailed uptime reports about their availability, average response time, and total uptime/downtime.
----

## Installation
----
Use the package manager [npm](https://www.npmjs.com/) to install url-monitor project.

```bash
npm install
```

## To Run It Locally
----
First: start mongo,
```bash
mongo
```
Then: run the url-monitor app.
```bash
npm start
```
## API Documentaion 
----
###  User

#### - [/api/user/create-account/]()
 creates a user account.
* **Method:**
  `POST`
  *  **Body**
      - `email`: user email.
      - `password`: password between 8 and 25 characteres long.

#### - [/api/user/verify-account/]()
verifies the user account.
* **Method:**
  `GET`
  *  **Params**
      - `token`: verification token sent to user's email.

#### - [/api/user/get-token/]()
gets the token that authenticate the user for the subsequent requests.
* **Method:**
  `GET`
  
#### - [/api/user/delete-account/]()
deletes the user account.
* **Method:**
  `DELETE`
  *  **Headers**
      - `Authorization`: 'JWT' concatenated to the token from the get-token request.

###  UrlCheck
#### - [/api/urlcheck/create-urlcheck/]()
creats a urlcheck.
* **Method:**
  `POST`
  *  **Headers**
      - `Authorization`: 'JWT' concatenated to the token from the get-token request.
  *  **Body**
      - `name`: The name of the check.
      - `url`: The URL to be monitored.
      - `protocol`: The resource protocol name `HTTP`, `HTTPS`, or `TCP`.
      - `path`: A specific path to be monitored *(optional)*.
      - `port`: The server port number *(optional)*.
      - `webhook`: A webhook URL to receive a notification on *(optional)*.
      - `timeout` *(defaults to 5 seconds)*: The timeout of the polling request *(optional)*.
      - `interval` *(defaults to 10 minutes)*: The time interval for polling requests *(optional)*.
      - `threshold` *(defaults to 1 failure)*: The threshold of failed requests that will create an alert *(optional)*.
      - `authentication`: An HTTP authentication header, with the Basic scheme, to be sent with the polling request *(optional)*.
          - `authentication.username`
          - `authentication.password`
      - `httpHeaders`: A list of key/value pairs custom HTTP headers to be sent with the polling request (optional).
      - `assert`: The response assertion to be used on the polling response (optional).
          - `assert.statusCode`: An HTTP status code to be asserted.
      - `tags`: A list of the check tags (optional).
      - `ignoreSSL`: A flag to ignore broken/expired SSL certificates in case of using the HTTPS protocol.
    
#### - [/api/urlcheck/get-urlcheck-by-id/]()
  gets a urlcheck by id.
* **Method:**
  `GET`
   *  **Headers**
      - `Authorization`: 'JWT' concatenated to the token from the get-token request.
   *  **Params**
      - `_id`: urlcheck id.
      
#### - [/api/urlcheck/get-urlcheck-by-name/]()
  gets a urlcheck by name.
* **Method:**
  `GET`
   *  **Headers**
      - `Authorization`: 'JWT' concatenated to the token from the get-token request.
   *  **Params**
      - `name`: urlcheck name.
      
#### - [/api/urlcheck/get-urlchecks/]()
  gets a urlchecks of user.
* **Method:**
  `GET`
   *  **Headers**
      - `Authorization`: 'JWT' concatenated to the token from the get-token request.
  
#### - [/api/urlcheck/update-urlcheck-by-id/]()
updates a urlcheck.
* **Method:**
  `POST`
  *  **Params**
      - `_id`: urlcheck id.
  *  **Headers**
      - `Authorization`: 'JWT' concatenated to the token from the get-token request.
  *  **Body**
      - `name`: The name of the check *(optional)*.
      - `url`: The URL to be monitored *(optional)*.
      - `protocol`: The resource protocol name `HTTP`, `HTTPS`, or `TCP` *(optional)*.
      - `path`: A specific path to be monitored *(optional)*.
      - `port`: The server port number *(optional)*.
      - `webhook`: A webhook URL to receive a notification on *(optional)*.
      - `timeout` *(defaults to 5 seconds)*: The timeout of the polling request *(optional)*.
      - `interval` *(defaults to 10 minutes)*: The time interval for polling requests *(optional)*.
      - `threshold` *(defaults to 1 failure)*: The threshold of failed requests that will create an alert *(optional)*.
      - `authentication`: An HTTP authentication header, with the Basic scheme, to be sent with the polling request *(optional)*.
          - `authentication.username`
          - `authentication.password`
      - `httpHeaders`: A list of key/value pairs custom HTTP headers to be sent with the polling request (optional).
      - `assert`: The response assertion to be used on the polling response (optional).
          - `assert.statusCode`: An HTTP status code to be asserted.
      - `tags`: A list of the check tags (optional).
      - `ignoreSSL`: A flag to ignore broken/expired SSL certificates in case of using the HTTPS protocol.
    
#### - [/api/urlcheck/update-urlcheck-by-name/]()
updates a urlcheck.
* **Method:**
  `POST`
  *  **Params**
      - `name`: urlcheck name.
  *  **Headers**
      - `Authorization`: 'JWT' concatenated to the token from the get-token request.
  *  **Body**
      - `name`: The name of the check *(optional)*.
      - `url`: The URL to be monitored *(optional)*.
      - `protocol`: The resource protocol name `HTTP`, `HTTPS`, or `TCP` *(optional)*.
      - `path`: A specific path to be monitored *(optional)*.
      - `port`: The server port number *(optional)*.
      - `webhook`: A webhook URL to receive a notification on *(optional)*.
      - `timeout` *(defaults to 5 seconds)*: The timeout of the polling request *(optional)*.
      - `interval` *(defaults to 10 minutes)*: The time interval for polling requests *(optional)*.
      - `threshold` *(defaults to 1 failure)*: The threshold of failed requests that will create an alert *(optional)*.
      - `authentication`: An HTTP authentication header, with the Basic scheme, to be sent with the polling request *(optional)*.
          - `authentication.username`
          - `authentication.password`
      - `httpHeaders`: A list of key/value pairs custom HTTP headers to be sent with the polling request (optional).
      - `assert`: The response assertion to be used on the polling response (optional).
          - `assert.statusCode`: An HTTP status code to be asserted.
      - `tags`: A list of the check tags (optional).
      - `ignoreSSL`: A flag to ignore broken/expired SSL certificates in case of using the HTTPS protocol.

#### - [/api/urlcheck/delete-urlcheck-by-name/]()
deletes urlcheck by name.
* **Method:**
  `DELETE`
  *  **Params**
      - `name`: urlcheck name.
  *  **Headers**
      - `Authorization`: 'JWT' concatenated to the token from the get-token request.
      
#### - [/api/urlcheck/delete-urlcheck-by-id/]()
deletes urlcheck by id.
* **Method:**
  `DELETE`
  *  **Params**
      - `_id`: urlcheck id.
  *  **Headers**
      - `Authorization`: 'JWT' concatenated to the token from the get-token request.

###  Report
#### - [/api/report/get-report-by-urlcheck-id/]()
  gets the report of urlcheck by id.
* **Method:**
  `GET`
   *  **Headers**
      - `Authorization`: 'JWT' concatenated to the token from the get-token request.
   *  **Params**
      - `id`: urlcheck id.

#### - [/api/report/get-report-by-urlcheck-name/]()
  gets the report of urlcheck by name.
* **Method:**
  `GET`
   *  **Headers**
      - `Authorization`: 'JWT' concatenated to the token from the get-token request.
   *  **Params**
      - `name`: urlcheck name.

#### - [/api/report/get-reports-by-tag/]()
  gets the reports of urlcheck by tag.
* **Method:**
  `GET`
   *  **Headers**
      - `Authorization`: 'JWT' concatenated to the token from the get-token request.
   *  **Params**
      - `tag`: urlchecks tag.

----
