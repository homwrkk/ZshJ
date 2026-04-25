# Supabase Setup Guide

## Overview
This guide explains how to set up your Supabase database for the Sheraton Special multi-tenant application with complaint form integration.

## Step 1: Copy the SQL Schema

1. Navigate to your Supabase project at: https://app.supabase.com
2. Go to the **SQL Editor** section from the left sidebar
3. Click **"New Query"** (or the plus icon)
4. Copy the entire contents of the `database.sql` file from your project root
5. Paste it into the SQL editor
6. Click **"Run"** to execute the SQL

This will create:
- `user_profiles` table - for multi-tenant user management with roles
- `complaints` table - for guest complaint submissions
- RLS (Row Level Security) policies for data protection
- Automatic timestamp triggers
- Sample data for testing

## Step 2: Verify Environment Variables

Check that your `.env` file contains:

```
VITE_SUPABASE_URL=https://ozanawzeovdrngnqzeja.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96YW5hd3plb3Zkcm5nbnF6ZWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1OTY5MDUsImV4cCI6MjA4ODE3MjkwNX0.wO0PcOGJAaRMEn3NSuBeVwnyzWE5rYyocD7BjMCJwRs
```

## Step 3: Test the Database Connection

Run the development server:
```bash
npm run dev
```

The app will attempt to connect to Supabase automatically.

## Database Schema Overview

### user_profiles Table
Stores user information with multi-tenant role support:

| Column | Type | Purpose |
|--------|------|---------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Links to auth.users |
| `email` | VARCHAR | User email |
| `role` | VARCHAR | `guest`, `manager`, or `service_provider` |
| `first_name` | VARCHAR | User first name |
| `last_name` | VARCHAR | User last name |
| `phone` | VARCHAR | Contact number |
| `room_number` | VARCHAR | Hotel room (for guests) |
| `service_type` | VARCHAR | Type of service (for providers) |
| `service_category` | VARCHAR | `internal` or `external` |
| `created_at` | TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | Last update time |

### complaints Table
Stores guest complaint submissions:

| Column | Type | Purpose |
|--------|------|---------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Linked user (if authenticated) |
| `guest_name` | VARCHAR | Guest full name |
| `email` | VARCHAR | Guest email |
| `room_number` | VARCHAR | Room where issue occurred |
| `complaint_type` | VARCHAR | Type of complaint |
| `description` | TEXT | Detailed complaint description |
| `priority` | VARCHAR | `low`, `medium`, `high`, or `urgent` |
| `status` | VARCHAR | `open`, `in_progress`, `resolved`, or `closed` |
| `attachments` | JSONB | File metadata array |
| `created_at` | TIMESTAMP | Submission time |
| `updated_at` | TIMESTAMP | Last update time |

## Row Level Security (RLS) Policies

### User Profiles
- **Read own profile**: Users can read their own profile
- **Update own profile**: Users can update their own profile
- **Insert own profile**: Users can create their own profile during signup
- **Manager access**: Managers can read all profiles

### Complaints
- **Read own complaints**: Users can read complaints they submitted
- **Submit complaints**: Anyone (authenticated or not) can submit complaints
- **Update own complaints**: Users can update their own complaints
- **Manager full access**: Managers can read and update all complaints

## Features Implemented

### 1. Multi-Tenant Registration (RegisterPage)
- **Role Selection Step**: Users choose between Guest, Manager, or Service Provider
- **Service Provider Details**: Additional fields for service type and category
- **Step Indicator**: Visual progress through registration steps
- **Database Integration**: Automatically saves user profile to `user_profiles` table

### 2. Guest Complaint Form (GuestComplaintForm)
- **Database Integration**: Complaints are saved to the `complaints` table
- **User Authentication**: Links complaints to authenticated users when available
- **Attachment Metadata**: Stores file information in JSONB format
- **Error Handling**: Displays user-friendly error messages
- **Loading State**: Shows submitting indicator while saving

### 3. Sample Data
The SQL includes 4 sample complaints for testing:
1. **Maintenance Issue** (Urgent) - HVAC problem
2. **Cleanliness** (High) - Bathroom cleaning issue
3. **Noise Disturbance** (Medium) - Adjacent room noise
4. **Missing Items** (Low) - Amenities not provided

## Frontend Components

### 1. Supabase Client (`client/lib/supabase.ts`)
- Initializes Supabase with environment variables
- Exports TypeScript interfaces for database tables
- Central connection point for all database operations

### 2. Registration Page Updates
- New role selection screen with visual indicators
- Service provider fields (type, category)
- Multi-step registration flow
- Step indicator showing progress

### 3. Complaint Form Updates
- Database save on submission
- Error handling and validation
- Loading state during submission
- Attachment metadata storage

## Testing

### Test Complaint Submission
1. Navigate to the home page
2. Scroll to the "Experience an Issue?" section
3. Click "Report an Issue"
4. Fill out the form:
   - Name: Test User
   - Email: test@example.com
   - Room: 301
   - Type: Maintenance Issue
   - Priority: Medium
   - Description: Test complaint
5. Click Submit
6. Should see success message

### Test Registration
1. Navigate to `/register`
2. Select a role (Guest, Manager, or Service Provider)
3. If Service Provider, fill out service details
4. Continue through the registration steps
5. Data will be saved to `user_profiles` table

### View Submissions
To view submitted complaints in Supabase:
1. Go to Supabase dashboard
2. Navigate to **Table Editor**
3. Select the `complaints` table
4. View all submitted complaints with their details

## Troubleshooting

### "Missing Supabase environment variables"
- Ensure `.env` file exists in project root
- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Restart dev server after changing .env

### RLS Policy Errors
- Complaints table allows unauthenticated submissions
- If getting permission errors, check RLS policies in Supabase
- Verify "Anyone can submit complaint" policy is enabled

### Complaints Not Saving
- Check browser console for error messages
- Verify table structure matches database.sql
- Ensure RLS policies are enabled
- Check that Supabase URL and key are correct

## Next Steps

### When Ready to Integrate More Features:
1. **User Authentication**: Integrate Supabase Auth
2. **Staff Portal**: Save task assignments to database
3. **Booking System**: Link reservations to database
4. **Loyalty Program**: Track points and membership data
5. **Reporting Dashboard**: Create manager dashboard with analytics

All features will follow the same pattern:
- Keep UI/UX intact
- Only replace hardcoded data with database queries
- Implement gradually, one feature at a time
- Test thoroughly before moving to next feature

---

For more help, see the [Supabase Documentation](https://supabase.com/docs)
