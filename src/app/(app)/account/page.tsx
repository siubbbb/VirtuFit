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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from '@/components/ui/separator';
import { useUser, setDocumentNonBlocking, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { useState, useEffect, useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Gender = "male" | "female" | "other";

export default function AccountPage() {
  const { user, isUserLoading } = useUser(); // AppLayout guarantees user is loaded, but we still need loading state
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const [gender, setGender] = useState<Gender | ''>('');
  const [isSaving, startSaveTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  useEffect(() => {
    if (userProfile?.gender) {
      setGender(userProfile.gender as Gender);
    }
  }, [userProfile]);

  const handleSaveChanges = () => {
    if (!user || !gender) return;
    startSaveTransition(() => {
        const userDocRef = doc(firestore, 'users', user.uid);
        setDocumentNonBlocking(userDocRef, { gender }, { merge: true });
        toast({
          title: 'Success!',
          description: 'Your profile has been updated.',
        });
    });
  };

  const handleDeleteAccount = () => {
    if (!user) return;
    startDeleteTransition(async () => {
      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        await deleteDoc(userDocRef);

        // This will trigger the onAuthStateChanged listener and redirect
        await user.delete();
        
        toast({
          title: 'Account Deleted',
          description: 'Your account and all data have been permanently removed.',
        });
        
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

  // The overall loading state depends on both user auth and profile fetching.
  const isLoading = isUserLoading || isProfileLoading;

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
            This is the email associated with your account and your selected gender.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select onValueChange={(value) => setGender(value as Gender)} value={gender} disabled={isLoading || isSaving}>
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select your gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Select id="email" disabled>
                <SelectTrigger>
                    <SelectValue placeholder={user?.email || 'No email'} />
                </SelectTrigger>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleSaveChanges} disabled={isLoading || isSaving || !gender}>
            {isSaving && <Loader2 className="mr-2 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
      
      <Separator className="my-8" />
      
      <Card className="border-destructive shadow-lg">
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
          <CardDescription>
            Your privacy is kept secure. Account deletion is permanent and cannot be undone.
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
                <Button variant="destructive" disabled={isDeleting || isLoading}>
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
