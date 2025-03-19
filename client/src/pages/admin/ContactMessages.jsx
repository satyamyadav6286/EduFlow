import React from 'react';
import { useGetContactsQuery } from '@/features/api/contactApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, Mail, MailOpen } from 'lucide-react';

const ContactMessages = () => {
  const { data, isLoading, error } = useGetContactsQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium">Error loading contact messages</h3>
        <p className="text-red-500">{error.data?.message || 'Something went wrong'}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <h1 className="text-2xl font-bold mb-6">Contact Messages</h1>
      
      {data?.contacts?.length === 0 ? (
        <div className="text-center py-10">
          <Mail className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No messages yet</h3>
          <p className="mt-1 text-gray-500">You'll see messages from users here when they contact you.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {data?.contacts?.map((contact) => (
            <ContactCard key={contact._id} contact={contact} />
          ))}
        </div>
      )}
    </div>
  );
};

const ContactCard = ({ contact }) => {
  const timeAgo = contact.createdAt ? formatDistanceToNow(new Date(contact.createdAt), { addSuffix: true }) : 'recently';

  return (
    <Card className={`transition-shadow hover:shadow-md ${!contact.isRead ? 'border-l-4 border-blue-500' : ''}`}>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-bold">{contact.name}</CardTitle>
          <CardDescription className="flex items-center">
            <a href={`mailto:${contact.email}`} className="hover:underline">
              {contact.email}
            </a>
            <span className="mx-2 text-gray-400">•</span>
            <span className="text-sm text-gray-500">{timeAgo}</span>
          </CardDescription>
        </div>
        <div className="flex items-center">
          {contact.isRead ? (
            <MailOpen className="h-5 w-5 text-gray-400" />
          ) : (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              New
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {contact.subject && (
          <h3 className="font-medium mb-2">Subject: {contact.subject}</h3>
        )}
        <p className="text-gray-700 whitespace-pre-wrap">{contact.message}</p>
      </CardContent>
    </Card>
  );
};

export default ContactMessages; 