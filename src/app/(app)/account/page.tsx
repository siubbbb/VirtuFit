'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { useUser, useAuth, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { doc, deleteDoc, getFirestore } from 'firebase/firestore';
import { useState, useEffect, useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = getFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [isSaving, startSaveTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
    }
  }, [user]);

  const handleSaveChanges = () => {
    if (!user) return;
    startSaveTransition(async () => {
      try {
        // Update Firebase Auth profile
        await updateProfile(user, { displayName });

        // Update Firestore profile
        const userDocRef = doc(firestore, 'users', user.uid);
        setDocumentNonBlocking(userDocRef, { displayName }, { merge: true });

        toast({
          title: 'Success!',
          description: 'Your profile has been updated.',
        });
      } catch (error) {
        console.error('Error updating profile:', error);
        toast({
          variant: 'destructive',
          title: 'Uh oh!',
          description: 'Could not save your changes. Please try again.',
        });
      }
    });
  };

  const handleDeleteAccount = () => {
    if (!user) return;
    startDeleteTransition(async () => {
      try {
        // Delete Firestore data first
        const userDocRef = doc(firestore, 'users', user.uid);
        await deleteDoc(userDocRef); // Use await here for sequential deletion

        // Then delete the user from Auth
        await user.delete();
        
        toast({
          title: 'Account Deleted',
          description: 'Your account and all data have been permanently removed.',
        });
        
        router.push('/');

      } catch (error: any) {
        console.error('Error deleting account:', error);
         toast({
          variant: 'destructive',
          title: 'Error Deleting Account',
          description: error.message || 'An unexpected error occurred.',
        });
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Account Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and privacy settings.
        </p>
      </header>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            This is your public display name and the email associated with your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} disabled={isUserLoading || isSaving} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={user?.email || ''} disabled />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleSaveChanges} disabled={isUserLoading || isSaving}>
            {isSaving && <Loader2 className="mr-2 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
      
      <Separator className="my-8" />
      
      <Card className="border-destructive shadow-lg">
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>
            These actions are permanent and cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Delete Account</h3>
              <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data.</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  {isDeleting && <Loader2 className="mr-2 animate-spin" />}
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account, your generated avatar, and all your measurement data
                    from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteAccount}
                    className="bg-destructive hover:bg-destructive/90"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Yes, delete my account'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
