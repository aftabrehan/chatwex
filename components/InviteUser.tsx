'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { getDocs, serverTimestamp, setDoc } from 'firebase/firestore'
import { PlusCircleIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormItem, FormField } from '@/components/ui/form'
import ShareLink from './ShareLink'
import { ToastAction } from './ui/toast'

import { addChatRef, chatMembersRef } from '@/lib/converters/ChatMembers'
import { getUserByEmailRef } from '@/lib/converters/User'
import { useToast } from '@/components/ui/use-toast'
import useAdminId from '@/hooks/useAdminId'
import { useSubscriptionStore } from '@/store/store'

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

function InviteUser({ chatId }: { chatId: string }) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const adminId = useAdminId({ chatId })
  const subscription = useSubscriptionStore(state => state.subscription)
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [openInviteLink, setOpenInviteLink] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!session?.user.id) return

    toast({
      title: 'Sending invite',
      description: 'Please wait while we send the invite...',
    })

    const noOfUsersInChat = (await getDocs(chatMembersRef(chatId))).docs.map(
      doc => doc.data()
    ).length

    const isPro = subscription?.status === 'active'

    if (!isPro && noOfUsersInChat >= 2) {
      return toast({
        title: 'Free plan limit exceeded',
        description:
          'You have exceeded the limit of uses in a single chat for the FREE plan. Please upgrade to PRO to continue adding usees to the chats!',
        variant: 'destructive',
        action: (
          <ToastAction
            altText="Upgrade"
            onClick={() => router.push('/register')}
          >
            Upgrade to PRO
          </ToastAction>
        ),
      })
    }

    const querySnapshot = await getDocs(getUserByEmailRef(values.email))

    if (querySnapshot.empty) {
      return toast({
        title: 'User not found',
        description: 'Please enter a valid email address of a registered user!',
        variant: 'destructive',
      })
    } else {
      const user = querySnapshot.docs[0].data()

      await setDoc(addChatRef(chatId, user.id), {
        userId: user.id!,
        email: user.email!,
        timestamp: serverTimestamp(),
        chatId: chatId,
        isAdmin: false,
        image: user.image || '',
      })
        .then(() => {
          toast({
            title: 'Added to chat',
            description: 'The user has beed added to the chat succesfully!',
            className: 'bg-green-600 text-white',
            duration: 3000,
          })

          setOpen(false)
          setOpenInviteLink(true)
        })
        .catch(() => {
          toast({
            title: 'Error',
            description:
              'Whooops... there was an error adding the user to the chat!',
            variant: 'destructive',
          })

          setOpen(false)
        })
    }

    form.reset()
  }

  return (
    adminId === session?.user.id && (
      <>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1">
              <PlusCircleIcon className="mr-1" />
              Invite to Chat
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add User to the Chat</DialogTitle>
              <DialogDescription>
                Simply enter another users email address to invite them to this
                chat!{' '}
                <span className="text-indigo-600 font-bold">
                  (Note: they must be registered)
                </span>
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col space-y-2"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="john@doe.com" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button className="ml-auto sm:w-fit w-full" type="submit">
                  Add To Chat
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <ShareLink
          isOpen={openInviteLink}
          setIsOpen={setOpenInviteLink}
          chatId={chatId}
        />
      </>
    )
  )
}

export default InviteUser
