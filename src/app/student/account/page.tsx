"use client";

import { useState } from 'react';
import { useDeskContext } from '@/context/DeskContext';
import { User, Mail, ShieldCheck, Bell, Clock, Settings, LogOut, Search } from 'lucide-react';
import Image from 'next/image';

export default function StudentAccount() {
  const { currentUser } = useDeskContext();
  const [activeTab, setActiveTab] = useState<'personal' | 'notifications' | 'history' | 'preferences'>('personal');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <h1 className="text-3xl font-bold text-desk-charcoal mb-8">Account Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-[12px] border border-gray-200 p-6 shadow-sm text-center">
            <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-white shadow-md mx-auto mb-4 bg-gray-100 flex items-center justify-center">
              <Image src="/student_avatar.png" alt="Student Profile" width={96} height={96} className="object-cover" />
            </div>
            <h2 className="text-xl font-bold text-desk-charcoal">{currentUser.name}</h2>
            <p className="text-sm text-gray-500 mb-6">Student</p>
            
            <button className="w-full py-2 bg-desk-charcoal text-white font-medium rounded-lg transition-colors text-sm hover:bg-gray-800">
              Edit Profile
            </button>
          </div>

          <div className="bg-white rounded-[12px] border border-gray-200 p-4 shadow-sm space-y-2">
            <button 
              onClick={() => setActiveTab('personal')}
              className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'personal' ? 'bg-gray-50 text-desk-charcoal' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <User className="h-4 w-4" />
              Personal Info
            </button>
            <button 
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'notifications' ? 'bg-gray-50 text-desk-charcoal' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Bell className="h-4 w-4" />
              Notifications
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'history' ? 'bg-gray-50 text-desk-charcoal' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Clock className="h-4 w-4" />
              Session History
            </button>
            <button 
              onClick={() => setActiveTab('preferences')}
              className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'preferences' ? 'bg-gray-50 text-desk-charcoal' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Settings className="h-4 w-4" />
              Preferences
            </button>
            <hr className="my-2" />
            <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-6">
          {activeTab === 'personal' && (
            <div className="bg-white rounded-[12px] border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-desk-charcoal mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <User className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-desk-charcoal">{currentUser.name}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Email Address</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-desk-charcoal">{currentUser.email}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Student ID</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <ShieldCheck className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-desk-charcoal">STD-2026-982</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-[12px] border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-desk-charcoal mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-desk-charcoal">Session Reminders</h4>
                    <p className="text-xs text-gray-500">Get notified 15 minutes before your session ends.</p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input type="checkbox" name="toggle" id="toggle1" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer" defaultChecked />
                    <label htmlFor="toggle1" className="toggle-label block overflow-hidden h-5 rounded-full bg-desk-green cursor-pointer"></label>
                  </div>
                </div>
                <hr className="border-gray-100" />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-desk-charcoal">Away Time Alerts</h4>
                    <p className="text-xs text-gray-500">Get notified when your away time is about to expire.</p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input type="checkbox" name="toggle" id="toggle2" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer" defaultChecked />
                    <label htmlFor="toggle2" className="toggle-label block overflow-hidden h-5 rounded-full bg-desk-green cursor-pointer"></label>
                  </div>
                </div>
                <hr className="border-gray-100" />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-desk-charcoal">Availability Alerts</h4>
                    <p className="text-xs text-gray-500">Notify me when my favorite floor has empty seats.</p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input type="checkbox" name="toggle" id="toggle3" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                    <label htmlFor="toggle3" className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer"></label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white rounded-[12px] border border-gray-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-desk-charcoal">Session History</h3>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search history..." 
                    className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-desk-amber"
                  />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold">Desk</th>
                      <th className="px-4 py-3 font-semibold">Duration</th>
                      <th className="px-4 py-3 rounded-r-lg font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-desk-charcoal">Today, 09:30 AM</td>
                      <td className="px-4 py-3 text-gray-600">Desk 12 • F3</td>
                      <td className="px-4 py-3 text-gray-600">2h 0m</td>
                      <td className="px-4 py-3 text-right">
                        <span className="px-2.5 py-1 bg-desk-green/10 text-desk-green text-xs font-semibold rounded-md">Completed</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-desk-charcoal">Yesterday, 02:15 PM</td>
                      <td className="px-4 py-3 text-gray-600">Desk 45 • F2</td>
                      <td className="px-4 py-3 text-gray-600">1h 15m</td>
                      <td className="px-4 py-3 text-right">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-md">Ended Early</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-desk-charcoal">Jun 10, 10:00 AM</td>
                      <td className="px-4 py-3 text-gray-600">Desk 08 • F3</td>
                      <td className="px-4 py-3 text-gray-600">2h 0m</td>
                      <td className="px-4 py-3 text-right">
                        <span className="px-2.5 py-1 bg-desk-amber/10 text-desk-amber text-xs font-semibold rounded-md">Auto-Released</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="bg-white rounded-[12px] border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-desk-charcoal mb-4">Preferences</h3>
              <p className="text-gray-500 text-sm">System preferences and general settings will appear here.</p>
            </div>
          )}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .toggle-checkbox:checked {
          right: 0;
          border-color: #68D391;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #68D391;
        }
        .toggle-checkbox {
          right: 20px;
          border-color: #CBD5E0;
          transition: all 0.3s;
        }
        .toggle-label {
          transition: all 0.3s;
        }
      `}} />
    </div>
  );
}
