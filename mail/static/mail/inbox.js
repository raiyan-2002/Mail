document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');

});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#all-mail').style.display = 'none';
  document.querySelector('#one-mail').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#all-mail').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#one-mail').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  all_mail = document.querySelector('#all-mail')
  all_mail.innerHTML = '';

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);
      emails.forEach(element => {
        const new_element = document.createElement('div');
        new_element.className = 'row';
        new_element.onclick = () => {
          console.log("This was clicked!");
          const id = element.id
          fetch(`/emails/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                read: true
            })
          });
          load_email(id)
        };

        const left = document.createElement('div');
        left.className = 'col-2';
        left.classList.add('bold');
        left.innerHTML = `${element.sender}`

        const right = document.createElement('div');
        right.innerHTML = `${element.timestamp}`
        right.className = 'col-5';
        right.classList.add('right');

        const middle = document.createElement('div');
        middle.innerHTML = `${element.subject}`
        middle.className = 'col-5';


        new_element.append(left)
        new_element.append(middle)
        new_element.append(right)

        if (element.read == false) {
          new_element.style.backgroundColor = 'lightgrey';
        }
        else {
          new_element.style.backgroundColor = 'white';
        }


        all_mail.append(new_element);
        
      });

  });

}

function send_email(event) {

  event.preventDefault();

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: `${document.querySelector('#compose-recipients').value}`,
        subject: `${document.querySelector('#compose-subject').value}`,
        body: `${document.querySelector('#compose-body').value}`
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent');
  });


}

function load_email(id) {
  console.log(id);

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#all-mail').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#one-mail').style.display = 'block';

  mail = document.querySelector('#one-mail');
  mail.innerHTML = '';

  const single_email = document.createElement('div');
  single_email.className = 'container1';

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {


    const recipients = email.recipients;

    const sender_div = document.createElement('div');
    const sender_bold = document.createElement('b');
    sender_bold.innerHTML += "From: ";
    sender_div.append(sender_bold);
    sender_div.innerHTML += email.sender;

    const recipients_div = document.createElement('div');
    const recipients_bold = document.createElement('b');
    recipients_bold.innerHTML += "To: ";
    recipients_div.append(recipients_bold);

    const subject_div = document.createElement('div');
    subject_div.className = 'main';
    const subject_bold = document.createElement('b');
    subject_bold.innerHTML += "Subject: ";
    subject_div.append(subject_bold);
    subject_div.innerHTML += email.subject;

    const body_div = document.createElement('div');
    body_div.className = 'main';
    body_div.innerHTML += email.body.replaceAll('\n','<br>');

    const timestamp_div = document.createElement('div');
    const timestamp_bold = document.createElement('b');
    timestamp_bold.innerHTML += "Timestamp: ";
    timestamp_div.append(timestamp_bold);
    timestamp_div.innerHTML += email.timestamp;

    for (let counter = 0 ; counter < recipients.length ; counter++) {
      recipients_div.innerHTML += recipients[counter];
      if (counter != recipients.length -1) {
        recipients_div.innerHTML += ", ";
      }
    }

    const archive_button = document.createElement('button');
    archive_button.classList.add('btn');
    archive_button.classList.add('btn-dark');

    if (email.archived == false) {
      archive_button.innerHTML = 'Archive';
    }
    else {
      archive_button.innerHTML = 'Unarchive';
    }

    archive_button.onclick = () => {
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: !email.archived
        })
      }).then(() => {
        load_mailbox('inbox');
      });
    };

    const reply_button = document.createElement('button');
    reply_button.classList.add('btn');
    reply_button.classList.add('btn-dark');
    reply_button.innerHTML = 'Reply';

    reply_button.onclick = () => {
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#all-mail').style.display = 'none';
      document.querySelector('#one-mail').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'block';
      
    
      // Clear out composition fields
      document.querySelector('#compose-recipients').value = email.sender;

      if (email.subject.startsWith("Re: ")){
        document.querySelector('#compose-subject').value = email.subject;
      }
      else {
        document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
      }
      document.querySelector('#compose-body').value = `\nOn ${email.timestamp}, ${email.sender} wrote: \n${email.body}`;


    }


    single_email.append(sender_div);
    single_email.append(recipients_div);
    single_email.append(timestamp_div);
    single_email.append(
      document.createElement('br')
    );
    single_email.append(subject_div);
    single_email.append(body_div);
    single_email.append(
      document.createElement('br')
    );
    single_email.append(archive_button);
    single_email.append(reply_button);

  });

  mail.append(single_email);

}