"use client";

import React, { useState } from "react";

interface FormCardProps {
  formData: {
    name: string;
    role: string;
    teamName: string;
    age: string;
    teamMembers: string[];
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      name: string;
      role: string;
      teamName: string;
      age: string;
      teamMembers: string[];
    }>
  >;
}

export default function FormCard({ formData, setFormData }: FormCardProps) {
  const [newMember, setNewMember] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    const nameTrim = newMember.trim();
    if (!nameTrim) return;

    if (formData.teamMembers.length >= 3) {
      alert("Maximum 3 team members supported.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      teamMembers: [...prev.teamMembers, nameTrim],
    }));
    setNewMember("");
  };

  const removeTeamMember = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  return (
    <div className="flex flex-col gap-5 p-6 border border-sand/15 bg-background-card/50 rounded-sm w-full hh-glass">
      <div className="border-b border-sand/10 pb-2">
        <h3 className="text-white text-[11px] font-bold tracking-[0.25em] uppercase">
          CARD METADATA CONFIG
        </h3>
        <span className="text-[8px] text-muted font-mono uppercase">
          ENTER DETAILS TO ENGRAVE ON YOUR TICKET
        </span>
      </div>

      <div className="flex flex-col gap-4 font-mono text-[9px]">
        {/* Name input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-muted font-bold uppercase tracking-wider">
            BUILDER NAME *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g. ARYAN SHARMA"
            className="w-full bg-black/40 border border-sand/20 focus:border-primary px-3 py-2 text-white text-[10px] focus:outline-none rounded-sm transition-colors"
            required
            maxLength={40}
          />
        </div>

        {/* Stack / Role input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-muted font-bold uppercase tracking-wider">
            STACK / ROLE *
          </label>
          <input
            type="text"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            placeholder="e.g. FULL STACK DEVELOPER"
            className="w-full bg-black/40 border border-sand/20 focus:border-primary px-3 py-2 text-white text-[10px] focus:outline-none rounded-sm transition-colors"
            required
            maxLength={40}
          />
        </div>

        {/* Split Grid for Team Name & Age */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-muted font-bold uppercase tracking-wider">
              TEAM NAME
            </label>
            <input
              type="text"
              name="teamName"
              value={formData.teamName}
              onChange={handleInputChange}
              placeholder="e.g. CYBER RESIDENTS"
              className="w-full bg-black/40 border border-sand/20 focus:border-primary px-3 py-2 text-white text-[10px] focus:outline-none rounded-sm transition-colors"
              maxLength={40}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-muted font-bold uppercase tracking-wider">
              AGE
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              placeholder="e.g. 24"
              className="w-full bg-black/40 border border-sand/20 focus:border-primary px-3 py-2 text-white text-[10px] focus:outline-none rounded-sm transition-colors"
              min="13"
              max="120"
            />
          </div>
        </div>

        {/* Team Members Input */}
        <div className="flex flex-col gap-2 border-t border-sand/10 pt-4 mt-1">
          <label className="text-muted font-bold uppercase tracking-wider block">
            ADD TEAM MEMBERS (MAX 3)
          </label>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={newMember}
              onChange={(e) => setNewMember(e.target.value)}
              placeholder="Teammate name..."
              className="flex-1 bg-black/40 border border-sand/20 focus:border-primary px-3 py-1.5 text-white text-[10px] focus:outline-none rounded-sm transition-colors"
              maxLength={30}
            />
            <button
              onClick={addTeamMember}
              disabled={formData.teamMembers.length >= 3}
              className="px-3 py-1.5 bg-primary/10 border border-primary/40 text-primary hover:bg-primary/20 transition-all font-bold uppercase text-[8px] disabled:opacity-40 disabled:hover:bg-primary/10 rounded-sm"
            >
              + ADD
            </button>
          </div>

          {/* Members List */}
          {formData.teamMembers.length > 0 && (
            <div className="flex flex-col gap-1.5 mt-2 bg-black/30 p-2 rounded-sm border border-sand/5">
              {formData.teamMembers.map((member, index) => (
                <div key={index} className="flex justify-between items-center text-white py-0.5 font-bold">
                  <span>- {member}</span>
                  <button
                    onClick={() => removeTeamMember(index)}
                    className="text-primary hover:text-white transition-colors cursor-pointer text-[9px] px-1 font-bold font-mono"
                  >
                    [REMOVE]
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
