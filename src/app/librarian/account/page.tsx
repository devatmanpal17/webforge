"use client";

import { User, Mail, ShieldCheck, Bell, Clock, Settings, LogOut, Sliders } from 'lucide-react';

export default function LibrarianAccount() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <h1 className="text-3xl font-bold text-desk-charcoal mb-8">Staff Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-[12px] border border-gray-200 p-6 shadow-sm text-center">
            <div className="h-24 w-24 rounded-full bg-desk-amber/15 text-desk-amber flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="h-10 w-10" />
            </div>
            <h2 className="text-xl font-bold text-desk-charcoal">Admin</h2>
            <p className="text-sm text-gray-500 mb-6">Library Staff</p>
            
            <button className="w-full py-2 bg-desk-charcoal text-white font-medium rounded-lg transition-colors text-sm hover:bg-gray-800">
              Edit Staff Profile
            </button>
          </div>

          <div className="bg-white rounded-[12px] border border-gray-200 p-4 shadow-sm space-y-2">
            <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-desk-charcoal bg-gray-50 rounded-lg">
              <User className="h-4 w-4" />
              Staff Info
            </button>
            <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              <Sliders className="h-4 w-4" />
              System Settings
            </button>
            <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              <Clock className="h-4 w-4" />
              Shift Schedule
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
          <div className="bg-white rounded-[12px] border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-desk-charcoal mb-4">Staff Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-desk-charcoal">Library Admin</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Staff Email</label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-desk-charcoal">admin@library.edu</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Staff ID</label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <ShieldCheck className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-desk-charcoal">LIB-STAFF-001</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[12px] border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-desk-charcoal mb-4">System Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-desk-charcoal">Flagged Seat Alerts</h4>
                  <p className="text-xs text-gray-500">Get notified when a seat becomes flagged (overdue).</p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input type="checkbox" name="toggle" id="toggle1" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer" defaultChecked />
                  <label htmlFor="toggle1" className="toggle-label block overflow-hidden h-5 rounded-full bg-desk-amber cursor-pointer"></label>
                </div>
              </div>
              <hr className="border-gray-100" />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-desk-charcoal">High Capacity Warning</h4>
                  <p className="text-xs text-gray-500">Alert when a floor reaches 90% capacity.</p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input type="checkbox" name="toggle" id="toggle2" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer" defaultChecked />
                  <label htmlFor="toggle2" className="toggle-label block overflow-hidden h-5 rounded-full bg-desk-amber cursor-pointer"></label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .toggle-checkbox:checked {
          right: 0;
          border-color: #F6AD55; /* desk-amber */
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #F6AD55;
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
