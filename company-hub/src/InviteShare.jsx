// InviteShare.jsx
import React, {useState} from 'react';
import axios from 'axios';

export default function InviteShare() {
  const [link, setLink] = useState('');
  const createInvite = async () => {
    const res = await axios.post('/api/employees/create-invite/', {}, {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
    });
    setLink(res.data.url);
  };
  const copy = () => navigator.clipboard.writeText(link);
  return (
    <div>
      <button onClick={createInvite}>Create Invite Link</button>
      {link && (
        <div>
          <p>Share this link:</p>
          <input readOnly value={link} style={{width: '90%'}}/>
          <button onClick={copy}>Copy</button>
        </div>
      )}
    </div>
  );
}
