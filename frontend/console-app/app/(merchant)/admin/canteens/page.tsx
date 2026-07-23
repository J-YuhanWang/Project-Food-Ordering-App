"use client";

import React, { useState, useEffect } from "react";
import { Plus, Pencil, UserMinus, Search, Building2, Mail, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {UserDTO} from "@/lib/user";
import apiClient from "@/lib/api/client";
import {CanteenAdminDTO} from "@/lib/canteen";


export default function CanteenManagementPage() {
  const [canteens, setCanteens] = useState<CanteenAdminDTO[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedCanteen, setSelectedCanteen] = useState<CanteenAdminDTO | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try{
      const [canteensRes, usersRes] = await Promise.all([
          apiClient.get('/api/v1/canteens/admin-view'),
          apiClient.get('/api/v1/users')
      ]);
      setCanteens(canteensRes.data.data);
      const allUsers: UserDTO[] = usersRes.data.data;
      setAvailableUsers(allUsers.filter((u)=>
      u.roles.includes("ROLE_MANAGER")));
    }catch{
      toast.error('Failed to load canteens');
    }finally{
      setIsLoading(false);
    }
  };

  const filteredCanteens = canteens.filter((canteen) =>
    canteen.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAssignDialog = (canteen: CanteenAdminDTO) => {
    setSelectedCanteen(canteen);
    setSelectedUserId("");
    setIsAssignDialogOpen(true);
  };

  const handleAssignManager = async () => {
    if (!selectedCanteen || !selectedUserId) {
      toast.error("Please select a manager to assign");
      return;
    }
    try{
      await apiClient.put(`/api/v1/canteens/${selectedCanteen.id}/manager/${selectedUserId}`)
      toast.success(`Manager assigned to ${selectedCanteen.name}`);
      setIsAssignDialogOpen(false);
      await fetchData()
    }catch{
      toast.error("Failed to assign manager.")
    }

  };

  const handleRemoveManager = async (canteen: CanteenAdminDTO) => {
    if (!canteen.manager) return;

    try{
      await apiClient.delete(`/api/v1/canteens/${canteen.id}/manager`)
      toast.success(`Manager removed from ${canteen.name}`);
      await fetchData()
    }catch{
      toast.error("Failed to remove manager.")
    }

  };

  const handleEditCanteen = (canteen: CanteenAdminDTO) => {
    toast.info(`Edit functionality for ${canteen.name} coming soon`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Canteen Management</h1>
          <p className="text-muted-foreground">Manage administrative accounts for each campus canteen.</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="rounded-3xl border-[#EAE5D9] bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search canteens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl border-[#EAE5D9] bg-white pl-10"
              />
            </div>
            <Button
              onClick={() => {
                setSelectedCanteen(null);
                setIsAssignDialogOpen(true);
              }}
              className="gap-2 rounded-xl bg-ucd-sage text-white hover:bg-ucd-sage/90"
            >
              <Plus className="h-4 w-4" />
              Assign New Manager
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Canteens Table */}
      <Card className="rounded-3xl border-[#EAE5D9] bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Canteens</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-16 flex-1" />
                </div>
              ))}
            </div>
          ) : filteredCanteens.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No canteens found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>CANTEEN NAME</TableHead>
                  <TableHead>ASSIGNED MANAGER</TableHead>
                  <TableHead>EMAIL ADDRESS</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead className="text-right">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCanteens.map((canteen) => (
                  <TableRow key={canteen.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ucd-sage/10">
                          <Building2 className="h-5 w-5 text-ucd-sage" />
                        </div>
                        <div>
                          <p className="font-medium">{canteen.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {canteen.manager ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={canteen.manager.profileUrl?? undefined} alt={canteen.manager.name} />
                            <AvatarFallback className="bg-ucd-sage text-white text-xs">
                              {canteen.manager.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{canteen.manager.name}</span>
                        </div>
                      ) : (
                        <span className="italic text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {canteen.manager ? (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {canteen.manager.email}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "rounded-full",
                          canteen.manager
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        )}
                      >
                        {canteen.manager ? "Active" : "Unassigned"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCanteen(canteen)}
                          className="rounded-lg border-ucd-sage text-ucd-sage hover:bg-ucd-sage/10"
                        >
                          <Pencil className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                        {canteen.manager && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveManager(canteen)}
                            className="rounded-lg border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <UserMinus className="mr-1 h-3 w-3" />
                            Remove
                          </Button>
                        )}
                        {!canteen.manager && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleOpenAssignDialog(canteen)}
                            className="rounded-lg bg-ucd-coral text-white hover:bg-ucd-coral/90"
                          >
                            <User className="mr-1 h-3 w-3" />
                            Assign
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Assign Manager Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Assign Manager</DialogTitle>
            <DialogDescription>
              {selectedCanteen
                ? `Assign a manager to ${selectedCanteen.name}`
                : "Select a canteen and assign a manager"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Canteen Select - only if no canteen pre-selected */}
            {!selectedCanteen && (
              <div className="space-y-2">
                <Label>Select Canteen</Label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    const canteen = canteens.find((c) => c.id === parseInt(value));
                    setSelectedCanteen(canteen || null);
                  }}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Choose a canteen" />
                  </SelectTrigger>
                  <SelectContent>
                    {canteens.filter((c) => !c.manager).map((canteen) => (
                      <SelectItem key={canteen.id} value={canteen.id.toString()}>
                        {canteen.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Manager Select */}
            <div className="space-y-2">
              <Label>Select Manager</Label>
              <Select
                value={selectedUserId}
                onValueChange={setSelectedUserId}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Choose a user" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{user.name}</span>
                        <span className="text-muted-foreground">({user.email})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Manager Preview */}
            {selectedUserId && (
              <div className="rounded-xl bg-ucd-oatmeal p-4">
                <p className="text-sm font-medium text-muted-foreground mb-1">Selected Manager</p>
                {(() => {
                  const user = availableUsers.find((u) => u.id === parseInt(selectedUserId));
                  return user ? (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-ucd-sage text-white">
                          {user.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleAssignManager}
              disabled={!selectedUserId || (!selectedCanteen)}
              className="rounded-xl bg-ucd-sage text-white hover:bg-ucd-sage/90"
            >
              Assign Manager
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
