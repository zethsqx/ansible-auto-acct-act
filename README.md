# Ansible-ActivateMe

Using ansible to self-service account activation

Webpage |----| Ansible |----| Google AppScript |----| Google Sheet 
       

Use ansible to manage a self service account activation process:  

1. User will access webpage to request account
2. Ansible will generate an activation key and 
  3a. Ansible will send email with activation link 
  3b. Ansible will send activation key to Google AppScript
4. Google AppScript will assign the key with an expiry time and store into GoogleSheet
5. When user click on the activation link, it will activate and redirect to the portal
6. Ansible will poll Google AppScript to check if user activated the link
7. Ansible will create account if poll result is positive
8. User can login using the created account

Ansible - 
* main.yml  
  roles/account_activation:    
    * tasks/main.yml  
    * templates/email_template.j2

Webpage - 
* request.html
  * account creation page
* index.html
  * general login page meant to replace guacamole default page

Google AppScript -
* doGet(e)
e is query type: 
  * add -   
  * activate - when request send over  
  * query - lookup the alive time of the activationkey  
  * delete - delete activition key after activated  
* addUserActKey(a,b)  
  * a is activationkey
  * b is expirydate  
* getTable()  
* setState(e,s)  
  * retrieve whole table and loop to find the key to set state of key  
* activateUser(actKey)  
  * return the status of the activation  
* deleteRecord(actKey)  
  * cleanup  
