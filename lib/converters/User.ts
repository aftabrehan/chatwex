import { User } from 'next-auth'
import {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  collection,
  query,
  where,
} from 'firebase/firestore'

import { db } from '@/firebase'

const userConverter: FirestoreDataConverter<User> = {
  toFirestore: function (customer: User): DocumentData {
    return {
      email: customer.email,
      image: customer.image,
      name: customer.name,
    }
  },
  fromFirestore: function (
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): User {
    const data = snapshot.data(options)

    return {
      id: snapshot.id,
      email: data.email,
      image: data.image,
      name: data.name,
    }
  },
}

export const getUserByEmailRef = (email: string) =>
  query(collection(db, 'users'), where('email', '==', email)).withConverter(
    userConverter
  )
