'use client';
import { redirect } from 'next/navigation';
import {useAuth} from "@/lib/auth-context";

export default function Home() {
  const {isLoggedIn, ready } = useAuth();
  if(!ready) return null;
  redirect(isLoggedIn ? '/admin' : '/login');
}
