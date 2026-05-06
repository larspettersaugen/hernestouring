-- Performance indexes for foreign keys and date filters that are hit on every
-- dashboard / tour / date page render. Without these, Postgres falls back to
-- sequential scans and queries get slower as the tables grow.
--
-- All `IF NOT EXISTS` so re-running this migration on environments that may
-- already have some indexes (e.g. Supabase auto-suggested) is safe.

-- TourDate: filtered by tourId everywhere; date used for ordering / range filters.
CREATE INDEX IF NOT EXISTS "TourDate_tourId_idx" ON "TourDate"("tourId");
CREATE INDEX IF NOT EXISTS "TourDate_tourId_date_idx" ON "TourDate"("tourId", "date");
CREATE INDEX IF NOT EXISTS "TourDate_date_idx" ON "TourDate"("date");
CREATE INDEX IF NOT EXISTS "TourDate_endDate_idx" ON "TourDate"("endDate");

-- TourDateTask: list per-date (sorted by sortOrder, createdAt).
CREATE INDEX IF NOT EXISTS "TourDateTask_tourDateId_idx" ON "TourDateTask"("tourDateId");

-- TourDateGuestListEntry: list per-date.
CREATE INDEX IF NOT EXISTS "TourDateGuestListEntry_tourDateId_idx" ON "TourDateGuestListEntry"("tourDateId");

-- AdvanceFile: list per-date.
CREATE INDEX IF NOT EXISTS "AdvanceFile_tourDateId_idx" ON "AdvanceFile"("tourDateId");

-- Contact: list per-tour (and per-date), join via personId / venueContactId.
CREATE INDEX IF NOT EXISTS "Contact_tourId_idx" ON "Contact"("tourId");
CREATE INDEX IF NOT EXISTS "Contact_tourDateId_idx" ON "Contact"("tourDateId");
CREATE INDEX IF NOT EXISTS "Contact_personId_idx" ON "Contact"("personId");
CREATE INDEX IF NOT EXISTS "Contact_venueContactId_idx" ON "Contact"("venueContactId");

-- ScheduleItem: list per-date, ordered by time.
CREATE INDEX IF NOT EXISTS "ScheduleItem_tourDateId_idx" ON "ScheduleItem"("tourDateId");

-- Flight: list per-tour (and per-date when set), ordered by departureTime.
CREATE INDEX IF NOT EXISTS "Flight_tourId_idx" ON "Flight"("tourId");
CREATE INDEX IF NOT EXISTS "Flight_tourDateId_idx" ON "Flight"("tourDateId");
CREATE INDEX IF NOT EXISTS "Flight_tourId_departureTime_idx" ON "Flight"("tourId", "departureTime");

-- FlightPassenger: lookup by member (the unique on flightId+memberId already covers flightId).
CREATE INDEX IF NOT EXISTS "FlightPassenger_travelGroupMemberId_idx" ON "FlightPassenger"("travelGroupMemberId");

-- TravelGroupMember: list per-tour, lookup by person.
CREATE INDEX IF NOT EXISTS "TravelGroupMember_tourId_idx" ON "TravelGroupMember"("tourId");
CREATE INDEX IF NOT EXISTS "TravelGroupMember_personId_idx" ON "TravelGroupMember"("personId");
CREATE INDEX IF NOT EXISTS "TravelGroupMember_tourId_personId_idx" ON "TravelGroupMember"("tourId", "personId");

-- TourDateMember: lookup by member (the unique on tourDateId+memberId already covers tourDateId).
CREATE INDEX IF NOT EXISTS "TourDateMember_travelGroupMemberId_idx" ON "TourDateMember"("travelGroupMemberId");

-- Transport: list per-date.
CREATE INDEX IF NOT EXISTS "Transport_tourDateId_idx" ON "Transport"("tourDateId");

-- TransportPassenger: lookup by member.
CREATE INDEX IF NOT EXISTS "TransportPassenger_travelGroupMemberId_idx" ON "TransportPassenger"("travelGroupMemberId");

-- Hotel: list per-date.
CREATE INDEX IF NOT EXISTS "Hotel_tourDateId_idx" ON "Hotel"("tourDateId");

-- HotelGuest: lookup by member.
CREATE INDEX IF NOT EXISTS "HotelGuest_travelGroupMemberId_idx" ON "HotelGuest"("travelGroupMemberId");

-- Tour: filtered by projectId / managerId, ordered by startDate / endDate.
CREATE INDEX IF NOT EXISTS "Tour_projectId_idx" ON "Tour"("projectId");
CREATE INDEX IF NOT EXISTS "Tour_managerId_idx" ON "Tour"("managerId");
CREATE INDEX IF NOT EXISTS "Tour_startDate_idx" ON "Tour"("startDate");
CREATE INDEX IF NOT EXISTS "Tour_endDate_idx" ON "Tour"("endDate");

-- Project: lookup by ownerId.
CREATE INDEX IF NOT EXISTS "Project_ownerId_idx" ON "Project"("ownerId");

-- DaySheetTemplate: list per-tour.
CREATE INDEX IF NOT EXISTS "DaySheetTemplate_tourId_idx" ON "DaySheetTemplate"("tourId");

-- DaySheetTemplateItem: list per-template.
CREATE INDEX IF NOT EXISTS "DaySheetTemplateItem_templateId_idx" ON "DaySheetTemplateItem"("templateId");

-- Person: filtered by type (people page), userId already unique-indexed.
CREATE INDEX IF NOT EXISTS "Person_type_idx" ON "Person"("type");

-- GroupMember: lookup by person.
CREATE INDEX IF NOT EXISTS "GroupMember_personId_idx" ON "GroupMember"("personId");
