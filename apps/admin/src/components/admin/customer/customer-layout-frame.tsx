"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import {
  Home,
  User,
  ShieldCheck,
  MapPin,
  Mail,
  Phone,
  Trash2,
  ShoppingCart,
  DollarSign,
  Edit,
  ArrowLeft,
  Calendar,
} from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CustomerLayoutFrameProps {
  currentTab: "overview" | "security" | "address-billing" | "notifications";
  pageTitle: string;
  children: React.ReactNode;
}

export function CustomerLayoutFrame({
  currentTab,
  pageTitle,
  children,
}: CustomerLayoutFrameProps) {
  const router = useRouter();
  const params = useParams();
  const customerIdParam = params?.id as string | undefined;

  // Shared Customer State
  const [customer, setCustomer] = useState({
    name: "Fatima Al-Zahra",
    customerId: "#100001",
    dateJoined: "Jan 15, 2026",
    avatar: null as string | null,
    ordersCount: 6,
    totalSpent: 1420,
    username: "fatima.alzahra",
    email: "fatima.alzahra@example.com",
    status: "Active",
    contact: "+971 50 123 4567",
    country: "United Arab Emirates",
  });

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    name: customer.name,
    username: customer.username,
    email: customer.email,
    contact: customer.contact,
    country: customer.country,
    status: customer.status,
  });

  useEffect(() => {
    if (!customerIdParam) return;
    const fetchCustomer = async () => {
      try {
        const res = await fetch(`/api/admin/users?limit=100`).catch(() => null);
        if (res && res.ok) {
          const json = await res.json();
          const list = Array.isArray(json) ? json : (json.data || []);
          const match = list.find((u: any) => String(u.id) === String(customerIdParam));
          if (match) {
            const fullName = [match.firstName, match.lastName].filter(Boolean).join(" ") || match.name || match.email;
            setCustomer({
              name: fullName,
              customerId: `#${match.id}`,
              dateJoined: match.createdAt ? new Date(match.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Jan 15, 2026",
              avatar: match.avatar || null,
              ordersCount: match._count?.orders ?? match.ordersCount ?? 0,
              totalSpent: match.totalSpent ?? 0,
              username: match.email?.split("@")[0] || "customer",
              email: match.email || "",
              status: (match.status as any) || "Active",
              contact: match.phone || "+971 50 123 4567",
              country: match.country || "United Arab Emirates",
            });
            setEditForm({
              name: fullName,
              username: match.email?.split("@")[0] || "customer",
              email: match.email || "",
              contact: match.phone || "+971 50 123 4567",
              country: match.country || "United Arab Emirates",
              status: (match.status as any) || "Active",
            });
          }
        }
      } catch (e) {
        console.error("Failed to fetch customer profile", e);
      }
    };
    fetchCustomer();
  }, [customerIdParam]);

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomer((prev) => ({
      ...prev,
      ...editForm,
    }));
    toast.success("Customer details updated successfully");
    setIsEditDialogOpen(false);
  };

  const handleDeleteCustomer = () => {
    toast.success(`Customer ${customer.name} deleted successfully`);
    setIsDeleteDialogOpen(false);
    router.push("/customers");
  };

  return (
    <div className="flex flex-1 flex-col space-y-6">
      {/* 1. Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Link
          href="/"
          className="hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-1 transition-colors"
          title="Home"
        >
          <Home className="size-3.5" />
        </Link>
        <span>/</span>
        <Link
          href="/customers"
          className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          Customers
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium">
          {customer.name}
        </span>
      </nav>

      {/* 2. Profile-style Customer Header (Matches /profile) */}
      <div className="rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white dark:bg-[#141414] shadow-xs overflow-hidden">
        {/* Cover Photo Banner */}
        <div className="relative h-44 sm:h-52 md:h-56 w-full bg-linear-to-r from-stone-900 via-neutral-800 to-stone-950 overflow-hidden">
          <Image
            src="/images/banner-user-profile.webp"
            alt="Customer Cover Banner"
            fill
            priority
            className="object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              {customer.status} Customer
            </span>
          </div>
        </div>

        {/* Identity & Details Section */}
        <div className="px-5 sm:px-8 pb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-10 sm:-mt-12 md:-mt-12">
            {/* Left: Minimal Avatar + Details */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-3.5 sm:gap-4">
              {/* Minimal Overlapping Avatar */}
              <div className="relative size-20 sm:size-24 rounded-full overflow-hidden border-4 border-white dark:border-[#141414] shadow-md bg-white dark:bg-zinc-800 shrink-0 ring-1 ring-black/5 dark:ring-white/10">
                <AvatarWithFallback
                  src={customer.avatar}
                  name={customer.name}
                  size={96}
                  className="size-full rounded-full text-lg font-bold object-cover"
                />
              </div>

              {/* Name & Meta Row */}
              <div className="pt-1 sm:pt-0 sm:pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {customer.name}
                  </h1>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">
                    {customer.customerId}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 text-emerald-500" />
                    Verified Client
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-indigo-500" />
                    {customer.country}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail className="size-3.5 text-gray-400" />
                    {customer.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="size-3.5 text-gray-400" />
                    {customer.contact}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Quick Action Controls */}
            <div className="pt-2 md:pt-0 md:pb-1 flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditForm({
                    name: customer.name,
                    username: customer.username,
                    email: customer.email,
                    contact: customer.contact,
                    country: customer.country,
                    status: customer.status,
                  });
                  setIsEditDialogOpen(true);
                }}
                className="h-8.5 px-3 rounded-xl text-xs font-semibold border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
              >
                <Edit className="size-3.5 mr-1.5" />
                Edit Details
              </Button>

              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="h-8.5 px-3 rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
              >
                <Trash2 className="size-3.5 mr-1.5" />
                Delete
              </Button>

              <Link href="/customers">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8.5 px-3 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
                >
                  <ArrowLeft className="size-3.5 mr-1.5" />
                  Back
                </Button>
              </Link>
            </div>
          </div>

          {/* Navigation Tabs (Overview & Orders) */}
          <nav className="mt-6 flex items-center gap-2 border-t border-gray-100 dark:border-white/5 pt-3.5 overflow-x-auto">
            <span
              className={cn(
                "flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-all duration-150 whitespace-nowrap bg-[#0070BA] text-white shadow-xs cursor-default"
              )}
            >
              <User className="size-3.5" />
              <span>Customer Overview & Orders</span>
            </span>
          </nav>
        </div>
      </div>

      {/* 3. Main Page Content (Overview Metrics and Orders Table) */}
      <div className="space-y-6">
        {children}
      </div>

      {/* Edit Details Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border-gray-200 dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Edit Customer Details
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 dark:text-gray-400">
              Update personal information and status for {customer.name}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCustomer} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="frame-name" className="text-xs font-medium">
                Full Name
              </Label>
              <Input
                id="frame-name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="h-10 rounded-xl text-xs sm:text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="frame-username" className="text-xs font-medium">
                Username
              </Label>
              <Input
                id="frame-username"
                value={editForm.username}
                onChange={(e) =>
                  setEditForm({ ...editForm, username: e.target.value })
                }
                className="h-10 rounded-xl text-xs sm:text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="frame-email" className="text-xs font-medium">
                Email
              </Label>
              <Input
                id="frame-email"
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                className="h-10 rounded-xl text-xs sm:text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="frame-phone" className="text-xs font-medium">
                  Contact
                </Label>
                <Input
                  id="frame-phone"
                  value={editForm.contact}
                  onChange={(e) =>
                    setEditForm({ ...editForm, contact: e.target.value })
                  }
                  className="h-10 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="frame-country" className="text-xs font-medium">
                  Country
                </Label>
                <Input
                  id="frame-country"
                  value={editForm.country}
                  onChange={(e) =>
                    setEditForm({ ...editForm, country: e.target.value })
                  }
                  className="h-10 rounded-xl text-xs sm:text-sm"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 flex sm:flex-row items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="rounded-xl text-xs h-9 px-4 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl text-xs h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Customer Alert Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="rounded-2xl border-gray-200 dark:border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-gray-900 dark:text-white">
              Delete Customer Account
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {customer.name}
              </span>{" "}
              ({customer.customerId})? All purchase history and customer records
              will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl text-xs h-9 px-4 cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCustomer}
              className="rounded-xl text-xs h-9 px-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer"
            >
              Delete Customer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
