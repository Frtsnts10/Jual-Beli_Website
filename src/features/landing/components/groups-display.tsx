"use client";

import React, { useMemo } from "react";
import { Chip, Card, Button } from "@heroui/react";
import { Users, Plus } from "lucide-react";
import { DigitalAccount } from "@/features/digital-accounts/actions/digital-account-actions";

interface GroupsDisplayProps {
  digitalAccounts?: DigitalAccount[];
}

export function GroupsDisplay({ digitalAccounts = [] }: GroupsDisplayProps) {
  // Map raw digital accounts to UI format
  const groups = useMemo(() => {
    const avatarColors = [
      "bg-indigo-500", "bg-rose-500", "bg-emerald-500", 
      "bg-amber-500", "bg-blue-500", "bg-pink-500", 
      "bg-cyan-500", "bg-violet-500"
    ];

    return digitalAccounts.map((acc, index) => {
      // Create members from the profiles array
      const currentMembers = (acc.profiles || []).map((profileName, i) => ({
        name: profileName,
        avatarBg: avatarColors[(index + i) % avatarColors.length]
      }));

      return {
        id: acc.id,
        appName: acc.provider || "Unknown App",
        maxMembers: acc.total_profiles || 5,
        currentMembers
      };
    });
  }, [digitalAccounts]);

  if (groups.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 py-28 relative">
      <div className="flex flex-col items-center text-center mb-16">
        <Chip variant="soft" size="sm" className="mb-3 font-bold tracking-widest uppercase text-[10px] border-none text-secondary">
          Shared Nodes
        </Chip>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase">Active Co-op Groups</h2>
        <p className="text-default-500 text-xs mt-3 uppercase tracking-wider font-bold max-w-2xl">
          Join an existing group to save costs immediately. Slots are limited per application.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {groups.map((group) => {
          const isFull = group.currentMembers.length === group.maxMembers;
          return (
            <Card key={group.id} className="border border-default-200 bg-background/60 backdrop-blur-md h-full">
              <div className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg leading-tight">{group.appName}</h3>
                    <Chip size="sm" className={`text-[10px] font-bold uppercase tracking-widest border-none ${isFull ? 'bg-danger text-white' : 'bg-success text-white'}`}>
                      {group.currentMembers.length}/{group.maxMembers}
                    </Chip>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {Array.from({ length: group.maxMembers }).map((_, i) => {
                      const member = group.currentMembers[i];
                      if (member) {
                        return (
                          <div key={i} className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${member.avatarBg}`}>
                              {member.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium">{member.name}</span>
                          </div>
                        );
                      }
                      return (
                        <div key={i} className="flex items-center gap-3 opacity-50">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center border border-dashed border-default-400 text-default-400">
                            <Plus size={12} />
                          </div>
                          <span className="text-sm font-medium text-default-400">Empty Slot</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Button 
                  className="w-full font-bold uppercase tracking-widest text-[10px] bg-primary text-white"
                  isDisabled={isFull}
                >
                  <Users size={16} />
                  {isFull ? "Group Full" : "Join Group"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
