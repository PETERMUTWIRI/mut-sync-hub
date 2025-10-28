import React from 'react';

const SendNotificationForm: React.FC = () => {
  return (
    <form>
      <h2 className="text-xl font-bold mb-4">Send Notification</h2>
      <input type="text" placeholder="Title" className="mb-2 p-2 rounded w-full" />
      <textarea placeholder="Message" className="mb-2 p-2 rounded w-full" />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Send</button>
    </form>
  );
};

export default SendNotificationForm;
