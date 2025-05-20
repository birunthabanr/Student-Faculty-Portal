"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { CalendarIcon, Filter, Plus, Edit, Trash2, Clock, Search } from "lucide-react"
import { Badge } from "./ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "./ui/dialog"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import axios from "axios"

// Simple Select Component
const Select = ({
  value,
  onValueChange,
  className = "",
  children,
}: {
  value: string
  onValueChange: (value: string) => void
  className?: string
  children: React.ReactNode
}) => (
  <select
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    className={`flex h-10 w-full rounded-md border border-gray-700 px-3 py-2 text-sm focus:outline-none ${className}`}
  >
    {children}
  </select>
)

// Simple Option Component
const SelectItem = ({
  value,
  children,
}: {
  value: string
  children: React.ReactNode
}) => <option value={value}>{children}</option>

// Resource type interface
interface Resource {
  id: string
  name: string
  type: string
  capacity: number
  location?: string
  status?: "available" | "under_maintenance" | "restricted"
  maintenanceNotes?: string
  maintenancePersons?: string[]
  lastMaintenance?: string
  nextMaintenance?: string
  maintained?: string
  accessibility?: string[]
}

// Booking interface
interface Booking {
  id: string
  resourceId?: string
  resourceName: string
  userId?: string
  userName?: string
  date: string
  startTime: string
  endTime: string
  purpose?: string
  status?: "confirmed" | "cancelled" | "pending"
  location?: string
  resource?: Resource
  createdAt?: string
  bookedBy?: string
}

// First, let's add a Person interface to match your API response
interface Person {
  id: number
  created_at: string
  name: string
  occupation: string
  contact_number: string
  resource_assigned: string | null
}

// Mock data for resources
const mockResources: Resource[] = [
  {
    id: "1",
    name: "Computer Lab A",
    type: "Lab",
    capacity: 30,
  },
  {
    id: "2",
    name: "Lecture Hall 101",
    type: "Auditorium",
    capacity: 120,
  },
  {
    id: "3",
    name: "Conference Room B",
    type: "Room",
    capacity: 15,
  },
  {
    id: "4",
    name: "University Van",
    type: "Vehicle",
    capacity: 8,
  },
  {
    id: "5",
    name: "Study Room 3",
    type: "Room",
    capacity: 6,
  },
]

// Mock data for bookings
const mockBookings: Booking[] = [
  {
    id: "1",
    resourceId: "1",
    resourceName: "Computer Lab A",
    userId: "S12345",
    userName: "John Smith",
    date: "2024-02-15",
    startTime: "09:00",
    endTime: "11:00",
    purpose: "Programming Workshop",
    status: "confirmed",
    location: "Main Building, Floor 2",
  },
  {
    id: "2",
    resourceId: "2",
    resourceName: "Lecture Hall 101",
    userId: "S12346",
    userName: "Jane Doe",
    date: "2024-02-16",
    startTime: "13:00",
    endTime: "15:00",
    purpose: "Guest Lecture",
    status: "confirmed",
    location: "Science Block",
  },
  {
    id: "3",
    resourceId: "4",
    resourceName: "University Van",
    userId: "S12347",
    userName: "Robert Johnson",
    date: "2024-02-17",
    startTime: "08:00",
    endTime: "17:00",
    purpose: "Field Trip",
    status: "cancelled",
    location: "Parking Lot A",
  },
]

// Time slots for the calendar view
const generateTimeSlots = (start: string, end: string, interval = 30) => {
  const slots = []
  let [hour, minute] = start.split(":" as const).map(Number)
  const [endHour, endMinute] = end.split(":" as const).map(Number)

  while (hour < endHour || (hour === endHour && minute <= endMinute)) {
    slots.push(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`)
    minute += interval
    if (minute >= 60) {
      minute = 0
      hour++
    }
  }
  return slots
}

const timeSlots = generateTimeSlots("07:00", "17:00")

const CalendarDay = ({
  date,
  resources,
  bookings,
  onBookResource,
}: {
  date: string
  resources: Resource[]
  bookings: Booking[]
  onBookResource: (resource: Resource, timeSlot: string) => void
}) => {
  return (
    <div className="border border-gray-700 rounded-md overflow-hidden">
      <div className="bg-gray-800 text-white p-3 font-medium">
        {new Date(date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-800 text-gray-200">
              <th className="p-2 border-r border-gray-700 text-left">Resource</th>
              {timeSlots.map((slot) => (
                <th key={slot} className="p-2 border-r border-gray-700 text-center min-w-[60px] text-xs">
                  {slot}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {resources.map((resource) => (
              <tr key={resource.id} className="border-t border-gray-700">
                <td className="p-2 border-r border-gray-700">
                  <div className="font-medium text-white">{resource.name}</div>
                  <div className="text-xs text-gray-400">{resource.location ?? "No location specified"}</div>
                </td>
                {timeSlots.map((slot) => {
                  const booking = bookings.find(
                    (b) =>
                      b.resource?.id === resource.id &&
                      b.date === date &&
                      b.startTime <= slot &&
                      b.endTime > slot &&
                      b.status === "confirmed",
                  )

                  const isBooked =
                    !!booking ||
                    bookings.some(
                      (b) =>
                        b.resourceId === resource.id &&
                        b.date === date &&
                        b.startTime <= slot &&
                        b.endTime > slot &&
                        b.status === "confirmed",
                    )
                  const isUnderMaintenance = resource.status === "under_maintenance"

                  const cellClass = `p-2 border-r border-gray-700 text-center text-xs ${
                    isBooked
                      ? "bg-red-900 text-red-300 font-medium"
                      : isUnderMaintenance
                        ? "bg-yellow-900 text-yellow-300 font-medium"
                        : "bg-green-900 hover:bg-green-800 text-green-300 font-medium cursor-pointer"
                  }`

                  return (
                    <td
                      key={`${resource.id}-${slot}`}
                      className={cellClass}
                      onClick={() => {
                        if (!isBooked && !isUnderMaintenance) {
                          onBookResource(resource, slot)
                        }
                      }}
                    >
                      {isBooked ? "Booked" : isUnderMaintenance ? "Maintenance" : "Available"}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Available Resources component
const AvailableResources = () => {
  const getTodayDateString = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resources, setResources] = useState<Resource[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedDate, setSelectedDate] = useState(getTodayDateString())
  const [resourceType, setResourceType] = useState<string>("all")
  const [capacity, setCapacity] = useState<string>("all")
  const [location, setLocation] = useState<string>("all")
  const [showBookingDialog, setShowBookingDialog] = useState<boolean>(false)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("")
  const [bookingDuration, setBookingDuration] = useState<string>("1")
  const [bookingPurpose, setBookingPurpose] = useState<string>("")
  const [user, setUser] = useState<User | null>(null)
  // Add a state variable for locations in the AvailableResources component
  const [locations, setLocations] = useState<string[]>([])

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8010/get-resources")
        const data = response.data

        // Transform keys and include location
        const formattedResources: Resource[] = data.map((r: any) => ({
          id: r.id,
          name: r.resource_name,
          type: r.resource_type,
          capacity: r.capacity,
          createdAt: r.created_at,
          maintained: r.maintained_by,
          location: r.location, // Include location from API response
        }))

        setResources(formattedResources)

        // Extract unique locations for the filter
        const uniqueLocations = [...new Set(formattedResources.map((r) => r.location).filter(Boolean))]
        setLocations(uniqueLocations)
      } catch (error) {
        console.error("Error fetching resources:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [])
  // Filter resources based on selected filters
  const filteredResources = resources.filter((resource) => {
    if (resourceType !== "all" && resource.type !== resourceType) return false
    if (capacity !== "all") {
      const [min, max] = capacity.split("-").map(Number)
      if (max && (resource.capacity < min || resource.capacity > max)) return false
      if (!max && resource.capacity < min) return false
    }
    if (location !== "all" && resource.location !== location) return false
    return true
  })
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8010/get-bookings")
        const rawData = response.data

        const formattedBookings: Booking[] = rawData.map((b: any) => {
          const resource = resources.find((res) => res.name === b.resource_name)

          return {
            id: b.id,
            date: b.booking_on,
            startTime: b.booking_starttime.slice(0, 5),
            endTime: b.booking_endtime.slice(0, 5),
            status: "confirmed",
            resource, // attach full resource object if needed
          }
        })

        setBookings(formattedBookings)
        setLoading(false)
      } catch (err) {
        console.error("Failed to fetch bookings:", err)
        setError("Failed to load bookings")
        setLoading(false)
      }
    }

    fetchData()
  }, [resources]) // make sure this runs after `resources` is loaded

  // Get unique locations for the filter
  // const locations = [...new Set(resources.map((r) => r.location.split(",")[0].trim()))]

  // Handle booking a resource
  const handleBookResource = (resource: Resource, timeSlot: string) => {
    setSelectedResource(resource)
    setSelectedTimeSlot(timeSlot)
    setShowBookingDialog(true)
  }

  // Handle confirming a booking
  const handleConfirmBooking = async () => {
    const user = await fetchUser()
    if (!user || !user.id || !selectedResource) {
      console.error("User not authenticated or resource not selected")
      return
    }

    // Format date as YYYY-MM-DD
    const formattedDate = new Date(selectedDate).toISOString().split("T")[0]

    // Format time as HH:MM:SS
    const formatTime = (time: string): string => {
      const [hour, minute] = time.split(":")
      return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}:00`
    }

    const bookingData = {
      booked_by: user.id,
      resource_name: selectedResource.name,
      start: formatTime(selectedTimeSlot),
      end: formatTime(calculateEndTime(selectedTimeSlot, Number.parseInt(bookingDuration))),
      booked_date: formattedDate,
    }
    console.log(bookingData)
    try {
      const response = await fetch("http://127.0.0.1:8010/create-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      })

      if (!response.ok) {
        throw new Error("Failed to create booking")
      }

      const data = await response.json()
      console.log("Booking confirmed:", data)

      // Add this code to update the bookings state immediately
      const newBooking: Booking = {
        id: data.id || String(Date.now()),
        resourceId: selectedResource.id,
        resourceName: selectedResource.name,
        date: selectedDate,
        startTime: selectedTimeSlot,
        endTime: calculateEndTime(selectedTimeSlot, Number.parseInt(bookingDuration)),
        status: "confirmed",
        resource: selectedResource,
      }
      setBookings((prevBookings) => [...prevBookings, newBooking])

      // Reset form state
      setShowBookingDialog(false)
      setSelectedResource(null)
      setSelectedTimeSlot("")
      setBookingDuration("1")
      setBookingPurpose("")
    } catch (error) {
      console.error("Error booking resource:", error)
    }
  }

  // Calculate end time based on start time and duration
  const calculateEndTime = (startTime: string, durationHours: number) => {
    const [hours, minutes] = startTime.split(":").map(Number)
    const endHours = hours + durationHours
    return `${endHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
  }

  const fetchUser = async (): Promise<User | null> => {
    try {
      const response = await fetch("http://localhost:8100/user", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Authentication failed")
      }

      const userData: User = await response.json()
      setUser(userData)
      return userData
    } catch (err) {
      console.log("Error in getting user:", err)
      return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader className="pb-3 pt-5">
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Resource Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-gray-200 mb-1 block">Resource Type</Label>
              <Select
                value={resourceType}
                onValueChange={setResourceType}
                className="bg-gray-800 border-gray-700 text-white"
              >
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Lab">Lab</SelectItem>
                <SelectItem value="Room">Lecture Room</SelectItem>
                <SelectItem value="Auditorium">Auditorium</SelectItem>
              </Select>
            </div>
            <div>
              <Label className="text-gray-200 mb-1 block">Capacity</Label>
              <Select value={capacity} onValueChange={setCapacity} className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="all">Any Capacity</SelectItem>
                <SelectItem value="1-10">1-10 People</SelectItem>
                <SelectItem value="11-30">11-30 People</SelectItem>
                <SelectItem value="31-100">31-100 People</SelectItem>
                <SelectItem value="101">100+ People</SelectItem>
              </Select>
            </div>
            {/* Update the location filter dropdown to use real locations */}
            <div>
              <Label className="text-gray-200 mb-1 block">Location</Label>
              <Select value={location} onValueChange={setLocation} className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </Select>
            </div>
            <div>
              <Label className="text-gray-200 mb-1 block">Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={getTodayDateString()}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar View */}
      <div className="space-y-4">
        <h3 className="text-lg text-gray-100 font-medium">Resource Availability Calendar</h3>
        <CalendarDay
          date={selectedDate}
          resources={filteredResources}
          bookings={bookings}
          onBookResource={handleBookResource}
        />
      </div>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Book Resource</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedResource && (
              <>
                <div className="space-y-2">
                  <Label>Selected Resource</Label>
                  <div className="p-3 bg-gray-800 border border-gray-700 rounded-md">
                    <div className="font-medium text-white">{selectedResource.name}</div>
                    <div className="text-sm text-gray-300 mt-1">
                      <span className="font-medium text-white">Location:</span>{" "}
                      {selectedResource.location || "No location specified"}
                    </div>
                    <div className="text-sm mt-1 text-gray-300">
                      <span className="font-medium text-white">Capacity:</span> {selectedResource.capacity} people
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" value={selectedDate} type="date" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Start Time</Label>
                    <Input id="time" value={selectedTimeSlot} disabled />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (hours)</Label>
                  <Select value={bookingDuration} onValueChange={setBookingDuration}>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="2">2 hours</SelectItem>
                    <SelectItem value="3">3 hours</SelectItem>
                    <SelectItem value="4">4 hours</SelectItem>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose (optional)</Label>
                  <Textarea
                    id="purpose"
                    placeholder="Enter the purpose of your booking"
                    value={bookingPurpose}
                    onChange={(e) => setBookingPurpose(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleConfirmBooking}>Confirm Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

type User = {
  id: string
  email: string
  name: string
  role: string
}

const BookedResources = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)

  const fetchUser = async (): Promise<User | null> => {
    try {
      const response = await fetch("http://localhost:8100/user", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Authentication failed")
      }

      const userData: User = await response.json()
      setUser(userData)
      return userData
    } catch (err) {
      console.log("Error in getting user:", err)
      return null
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await fetchUser()

        if (!user) {
          setError("User not authenticated")
          setLoading(false)
          return
        }

        console.log("Sending user ID:", user.id)

        const response = await axios.get("http://127.0.0.1:8010/get-bookings-user", {
          params: { userid: user.id },
        })

        const formattedBookings: Booking[] = response.data.map((b: any) => ({
          id: b.id,
          resourceName: b.resource_name,
          date: b.booking_on,
          startTime: b.booking_starttime.slice(0, 5), // "HH:mm"
          endTime: b.booking_endtime.slice(0, 5),
        }))

        setBookings(formattedBookings)
        setLoading(false)
      } catch (err) {
        console.error("Failed to fetch bookings:", err)
        setError("Failed to load bookings")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editBookingForm, setEditBookingForm] = useState({
    id: "",
    date: "",
    startTime: "",
    endTime: "",
  })

  const handleEditBooking = (booking: Booking) => {
    setEditBookingForm({
      id: booking.id,
      date: booking.date,
      startTime: formatTimeToHHMM(booking.startTime),
      endTime: formatTimeToHHMM(booking.endTime),
    })
    setShowEditDialog(true)
  }

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      const response = await fetch("http://127.0.0.1:8010/delete-booking", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: bookingId }),
      })

      const data = await response.json()

      if (response.ok && data.status === "success") {
        setBookings((prev) => prev.filter((b) => b.id !== bookingId))
      } else {
        throw new Error(data.message || "Failed to delete booking")
      }
    } catch (error: unknown) {
      console.error("Delete failed:", error)
      alert("Error deleting booking: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  const formatTimeToHHMM = (timeString: string): string => {
    if (!timeString) return ""
    return timeString.slice(0, 5)
  }

  const normalizeBooking = (booking: any): Booking => ({
    id: booking.id,
    createdAt: booking.created_at,
    bookedBy: booking.booked_by,
    resourceName: booking.resource_name,
    date: booking.booking_on,
    startTime: formatTimeToHHMM(booking.start_time),
    endTime: formatTimeToHHMM(booking.end_time),
  })

  const handleSaveEditedBooking = async () => {
    const body = {
      ...editBookingForm,
      date: formatDateToYYYYMMDD(editBookingForm.date),
    }
    try {
      const response = await fetch("http://127.0.0.1:8010/booking-update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error("Failed to update booking")
      }

      const updated = await response.json()
      const normalizedUpdated = normalizeBooking(updated)

      setBookings((prev) => prev.map((b) => (b.id === normalizedUpdated.id ? normalizedUpdated : b)))

      setShowEditDialog(false)
    } catch (error) {
      console.error("Update failed:", error)
      alert("Error updating booking")
    }
  }

  const formatDateToYYYYMMDD = (date: string): string => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )

  if (error)
    return (
      <div className="bg-red-900/20 border border-red-500/50 text-red-300 rounded-md p-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        {error}
      </div>
    )

  // Group bookings by date for better organization
  const bookingsByDate = bookings.reduce(
    (acc, booking) => {
      const date = booking.date
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(booking)
      return acc
    },
    {} as Record<string, Booking[]>,
  )

  // Sort dates in descending order (newest first)
  const sortedDates = Object.keys(bookingsByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-l font-medium text-white">Your Bookings</h3>
        <span className="text-sm text-gray-400">{bookings.length} total bookings</span>
      </div>

      {bookings.length > 0 ? (
        <div className="space-y-8">
          {sortedDates.map((date) => (
            <div key={date} className="space-y-3">
              <div className="flex items-center">
                <div className="h-0.5 flex-grow bg-gray-800 mr-3"></div>
                <h4 className="text-sm font-medium text-gray-400 flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1.5" />
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </h4>
                <div className="h-0.5 flex-grow bg-gray-800 ml-3"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookingsByDate[date].map((booking) => (
                  <Card
                    key={booking.id}
                    className="overflow-hidden bg-gray-900 border border-gray-800 shadow-md hover:shadow-lg transition-all duration-200 hover:border-gray-700"
                  >
                    <CardHeader className="bg-gray-800 border-b border-gray-700 pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base text-white">{booking.resourceName}</CardTitle>
                        <Badge variant="outline" className="bg-blue-900/20 text-blue-300 border-blue-500/30 text-xs">
                          {booking.startTime} - {booking.endTime}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-4">
                      <div className="flex justify-between mb-4">
                        <div className="flex items-center text-sm text-gray-400">
                          <Clock className="h-4 w-4 mr-1.5 text-gray-500" />
                          <span>
                            {Math.round(
                              ((new Date(`2000/01/01 ${booking.endTime}:00`).getTime() -
                                new Date(`2000/01/01 ${booking.startTime}:00`).getTime()) /
                                1000 /
                                60 /
                                60) *
                                10,
                            ) / 10}{" "}
                            hours
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => handleEditBooking(booking)}
                          variant="secondary"
                          className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-100"
                        >
                          <Edit className="h-3.5 w-3.5 mr-1.5" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteBooking(booking.id)}
                          className="flex-1 bg-red-900/40 hover:bg-red-800/60 text-red-200 border border-red-800/30"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-gray-700 rounded-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
            <CalendarIcon className="h-8 w-8 text-gray-500" />
          </div>
          <h4 className="text-lg font-medium text-gray-300 mb-1">No bookings found</h4>
          <p className="text-gray-500 max-w-sm mx-auto">
            You don't have any booked resources yet. Check the Available Resources tab to make a booking.
          </p>
        </div>
      )}

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-gray-900 border border-gray-800">
          <DialogHeader className="border-b border-gray-800 pb-3">
            <DialogTitle className="text-white">Edit Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-date" className="text-gray-300">
                Booking Date
              </Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input
                  id="edit-date"
                  type="date"
                  value={editBookingForm.date}
                  onChange={(e) => setEditBookingForm({ ...editBookingForm, date: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-gray-200 pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-start" className="text-gray-300">
                  Start Time
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <Input
                    id="edit-start"
                    type="time"
                    value={editBookingForm.startTime}
                    onChange={(e) => setEditBookingForm({ ...editBookingForm, startTime: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-gray-200 pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-end" className="text-gray-300">
                  End Time
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <Input
                    id="edit-end"
                    type="time"
                    value={editBookingForm.endTime}
                    onChange={(e) => setEditBookingForm({ ...editBookingForm, endTime: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-gray-200 pl-10"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="border-t border-gray-800 pt-3">
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEditedBooking} className="bg-blue-600 hover:bg-blue-700 text-white">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Resource Management component
const ResourceManagement = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resources, setResources] = useState<Resource[]>([])
  const [showAddResourceDialog, setShowAddResourceDialog] = useState<boolean>(false)
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState<boolean>(false)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>("")

  // Add these state variables at the beginning of the ResourceManagement component:

  const [people, setPeople] = useState<Person[]>([])
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [selectedResourceId, setSelectedResourceId] = useState<string>("0") // Updated default value to be a non-empty string
  const [showAssignmentDialog, setShowAssignmentDialog] = useState<boolean>(false)
  const [assignmentNotes, setAssignmentNotes] = useState<string>("")

  // Add a new state variable for the "add person" dialog:
  const [showAddPersonDialog, setShowAddPersonDialog] = useState<boolean>(false)

  // Add a new state for the person form:
  const [newPersonForm, setNewPersonForm] = useState({
    name: "",
    occupation: "",
    contact_number: "",
  })
const fetchResources = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8010/get-resources")
        const data = response.data

        // Transform keys and include location
        const formattedResources: Resource[] = data.map((r: any) => ({
          id: r.id,
          name: r.resource_name,
          type: r.resource_type,
          capacity: r.capacity,
          createdAt: r.created_at,
          maintained: r.maintained_by,
          location: r.location, // Include location from API response
        }))

        setResources(formattedResources)
      } catch (error) {
        console.error("Error fetching resources:", error)
      } finally {
        setLoading(false)
      }
    }
  useEffect(() => {
    fetchResources()
  }, [])

  // Add this useEffect to fetch people data
  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8010/get-people")
        setPeople(response.data)
      } catch (error) {
        console.error("Error fetching people:", error)
      }
    }

    fetchPeople()
  }, [])

  // New resource form state
  const [newResourceForm, setNewResourceForm] = useState<Partial<Resource>>({
    name: "",
    type: "Room",
    capacity: 0,
    location: "",
    accessibility: [],
    status: "available",
  })

  // Maintenance form state
  const [maintenanceForm, setMaintenanceForm] = useState({
    status: "available",
    notes: "",
    persons: "",
    fromDate: "",
    toDate: "",
  })

  // Handle adding a new resource
  const handleAddResource = async () => {
    if (!newResourceForm.name || !newResourceForm.type || !newResourceForm.capacity) {
      alert("Please fill in all required fields")
      return
    }

    try {
      const response = await fetch("http://127.0.0.1:8010/resource-insert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newResourceForm.name,
          type: newResourceForm.type,
          capacity: newResourceForm.capacity,
          location: newResourceForm.location,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to insert resource")
      }

      const result = await response.json()

      const newResourceWithId: Resource = {
        id: `${resources.length + 1}`,
        name: newResourceForm.name ?? "",
        type: newResourceForm.type ?? "Room",
        capacity: newResourceForm.capacity ?? 0,
        location: newResourceForm.location ?? "",
        accessibility: newResourceForm.accessibility ?? [],
      }

      setResources([...resources, newResourceWithId])
      await fetchResources()
      setShowAddResourceDialog(false)
      setNewResourceForm({
        name: "",
        type: "Room",
        capacity: 0,
        location: "",
        accessibility: [],
        status: "available",
      })
    } catch (error: unknown) {
      console.error("Error adding resource:", error)
      alert("Error adding resource: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  // Update the handleEditResource function to include location in the API request
  const handleEditResource = async (
    resourceId: string,
    updatedResource: {
      name: string
      type: string
      capacity: number
      location: string
    },
  ) => {
    try {
      const id = parseInt(resourceId)
      const response = await fetch(`http://127.0.0.1:8010/resource-update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedResource),
      })

      if (!response.ok) {
        throw new Error("Failed to update resource")
      }

      const result = await response.json()
      
      await fetchResources()
      // setResources((prevResources) =>
      //   prevResources.map((resource) => (resource.id === resourceId ? { ...resource, ...updatedResource } : resource)),
      // )
    } catch (error: unknown) {
      console.error("Error updating resource:", error)
      alert("Error updating resource: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }
  // Handle updating resource assignment
  const handleUpdateMaintenance = async () => {
    if (!selectedResource) return

    try {
      // In a real app, this would make an API call to update the resource
      const updatedResources = resources.map((resource) =>
        resource.id === selectedResource.id
          ? {
              ...resource,
              maintained: maintenanceForm.persons,
              maintenanceNotes: maintenanceForm.notes,
            }
          : resource,
      )

      setResources(updatedResources)
      setShowMaintenanceDialog(false)

      // This would be an API call in a real application
      // await fetch(`http://127.0.0.1:8010/resource-assign/${selectedResource.id}`, {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     maintained_by: maintenanceForm.persons,
      //     notes: maintenanceForm.notes
      //   }),
      // })
    } catch (error) {
      console.error("Error updating assignment:", error)
      alert("Error updating assignment")
    }
  }

  // Handle opening the assignment dialog
  const handleOpenMaintenanceDialog = (resource: Resource) => {
    setSelectedResource(resource)
    setMaintenanceForm({
      status: "available", // This is less relevant for assignments but keeping for compatibility
      notes: resource.maintenanceNotes || "",
      persons: resource.maintained || "",
      fromDate: "", // No longer needed
      toDate: "", // No longer needed
    })
    setShowMaintenanceDialog(true)
  }
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [resourceBeingEdited, setResourceBeingEdited] = useState<Resource | null>(null)
  const [editForm, setEditForm] = useState({
    name: "",
    type: "",
    capacity: 0,
    location: "",
  })

  // Filter resources based on search query
  const filteredResources = resources.filter(
    (resource) =>
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.type.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Get status badge for a resource
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-500">Available</Badge>
      case "under_maintenance":
        return <Badge className="bg-yellow-500">Under Maintenance</Badge>
      case "restricted":
        return <Badge className="bg-red-500">Restricted</Badge>
      default:
        return null
    }
  }

  const handleDeleteResource = async (id: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:8010/resource-delete/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to delete resource")
      }

      setResources((prev) => prev.filter((resource) => resource.id !== id))
    } catch (error) {
      console.error("Delete error:", error)
      alert("Error deleting resource.")
    }
  }

  // Add these functions to handle assignment
  const handleOpenAssignmentDialog = (person: Person) => {
    setSelectedPerson(person)
    // Make sure we're setting the correct resource ID from the person object
    setSelectedResourceId(person.resource_assigned ? String(person.resource_assigned) : "0")
    setAssignmentNotes("")
    setShowAssignmentDialog(true)
  }

  const handleUpdateAssignment = async () => {
    if (!selectedPerson) return

    try {
      // Make API call to assign the person to a resource
      // Reverting to the original approach that was working before
      const response = await fetch(
        `http://127.0.0.1:8010/assign-people?person_id=${selectedPerson.id}&resource=${selectedResourceId || 0}`,
        {
          method: "PUT",
        },
      )

      if (!response.ok) {
        throw new Error("Failed to update assignment")
      }

      // Get the updated data from the server
      const updatedPeopleResponse = await axios.get("http://127.0.0.1:8010/get-people")
      setPeople(updatedPeopleResponse.data)

      setShowAssignmentDialog(false)
    } catch (error) {
      console.error("Error updating assignment:", error)
      alert("Error updating assignment")
    }
  }

  // Add a function to handle adding a new person:
  const handleAddPerson = async () => {
    if (!newPersonForm.name || !newPersonForm.occupation || !newPersonForm.contact_number) {
      alert("Please fill in all required fields")
      return
    }

    try {
      const response = await fetch("http://127.0.0.1:8010/add-people", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPersonForm),
      })

      if (!response.ok) {
        throw new Error("Failed to add person")
      }

      // Refresh the people list
      const updatedPeopleResponse = await axios.get("http://127.0.0.1:8010/get-people")
      setPeople(updatedPeopleResponse.data)

      setShowAddPersonDialog(false)
      setNewPersonForm({
        name: "",
        occupation: "",
        contact_number: "",
      })
    } catch (error: unknown) {
      console.error("Error adding person:", error)
      alert("Error adding person: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">Resource Management</h1>
        <p className="text-muted-foreground">Manage and book resources across the campus</p>
      </div>

      <Tabs defaultValue="available" className="flex-1">
        <TabsList className="bg-gray-800 border-b border-gray-700">
          <TabsTrigger value="available" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white">
            Available Resources
          </TabsTrigger>
          <TabsTrigger value="booked" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white">
            Booked Resources
          </TabsTrigger>
          <TabsTrigger value="management" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white">
            Resource Management
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white">
            Maintenance Dashboard
          </TabsTrigger>
        </TabsList>

        {/* Available */}
        <TabsContent value="available" className="mt-6 flex-1">
          <AvailableResources />
        </TabsContent>

        {/* Booked */}
        <TabsContent value="booked" className="mt-6 flex-1">
          <BookedResources />
        </TabsContent>

        {/* Management */}
        <TabsContent value="management" className="mt-6 flex-1">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">Manage Resources</h3>
              <Button onClick={() => setShowAddResourceDialog(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add New Resource
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="border border-gray-700 rounded-md overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800 text-gray-200">
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Type</th>
                    <th className="p-3 text-left">Capacity</th>
                    <th className="p-3 text-left">Location</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResources.map((resource) => (
                    <tr key={resource.id} className="border-t border-gray-700 hover:bg-gray-700">
                      <td className="p-3 text-white">{resource.name}</td>
                      <td className="p-3 text-white">{resource.type}</td>
                      <td className="p-3 text-white">{resource.capacity}</td>
                      <td className="p-3 text-white">{resource.location || "Not specified"}</td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setResourceBeingEdited(resource)
                              setEditForm({
                                name: resource.name,
                                type: resource.type,
                                capacity: resource.capacity,
                                location: resource.location || "",
                              })
                              setShowEditDialog(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          {showEditDialog && (
                            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Resource</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <Input
                                    placeholder="Name"
                                    value={editForm.name ?? ""}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                  />
                                  <Input
                                    placeholder="Type"
                                    value={editForm.type ?? ""}
                                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                                  />
                                  <Input
                                    type="number"
                                    placeholder="Capacity"
                                    value={editForm.capacity ?? 0}
                                    onChange={(e) => setEditForm({ ...editForm, capacity: Number(e.target.value) })}
                                  />
                                  <Input
                                    placeholder="Location"
                                    value={editForm.location ?? ""}
                                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                  />
                                </div>
                                <DialogFooter>
                                  <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                  </DialogClose>
                                  <Button
                                    onClick={async () => {
                                      if (resourceBeingEdited) {
                                        await handleEditResource(resourceBeingEdited.id, {
                                          name: editForm.name ?? "",
                                          type: editForm.type ?? "Room",
                                          capacity: editForm.capacity ?? 0,
                                          location: editForm.location ?? "",
                                        })
                                        setShowEditDialog(false)
                                      }
                                    }}
                                  >
                                    Save Changes
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-400 hover:text-red-300"
                            onClick={() => handleDeleteResource(resource.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredResources.length === 0 && (
                <div className="p-8 text-center text-gray-400">No resources found matching your search.</div>
              )}
            </div>
          </div>

          {/* Add Resource Dialog */}
          <Dialog open={showAddResourceDialog} onOpenChange={setShowAddResourceDialog}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Resource</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Resource Name *</Label>
                    <Input
                      id="name"
                      value={newResourceForm.name ?? ""}
                      onChange={(e) => setNewResourceForm({ ...newResourceForm, name: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Resource Type *</Label>
                    <Select
                      value={newResourceForm.type ?? "Room"}
                      onChange={(value) => setNewResourceForm({ ...newResourceForm, type: value })}
                      className="bg-gray-800 border-gray-700 text-white"
                    >
                      <SelectItem value="Lab">Lab</SelectItem>
                      <SelectItem value="Room">Lecture Room</SelectItem>
                      <SelectItem value="Auditorium">Auditorium</SelectItem>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={newResourceForm.capacity}
                    onChange={(e) =>
                      setNewResourceForm({ ...newResourceForm, capacity: Number.parseInt(e.target.value) })
                    }
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={newResourceForm.location ?? ""}
                    onChange={(e) => setNewResourceForm({ ...newResourceForm, location: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Building name, floor, room number, etc."
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleAddResource}>Add Resource</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* People Assignments */}
        <TabsContent value="maintenance" className="mt-6 flex-1">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">People Assignments</h3>
              <Button onClick={() => setShowAddPersonDialog(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add New Person
              </Button>
            </div>

            <div className="border border-gray-700 rounded-md overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800 text-gray-200">
                    <th className="p-3 text-left">Person Name</th>
                    <th className="p-3 text-left">Occupation</th>
                    <th className="p-3 text-left">Contact</th>
                    <th className="p-3 text-left">Assigned Resource</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {people.map((person) => {
                    const assignedResource = resources.find((r) => r.id === person.resource_assigned)
                    return (
                      <tr key={person.id} className="border-t border-gray-700 hover:bg-gray-700">
                        <td className="p-3 text-white">{person.name}</td>
                        <td className="p-3 text-white">{person.occupation}</td>
                        <td className="p-3 text-white">{person.contact_number}</td>
                        <td className="p-3 text-white">{assignedResource ? assignedResource.name : "None"}</td>
                        <td className="p-3">
                          <Button variant="outline" size="sm" onClick={() => handleOpenAssignmentDialog(person)}>
                            Assign
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {people.length === 0 && <div className="p-8 text-center text-gray-400">No people found.</div>}
            </div>
          </div>

          {/* Assignment Dialog */}
          <Dialog open={showAssignmentDialog} onOpenChange={setShowAssignmentDialog}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {selectedPerson ? `Assign Resource to: ${selectedPerson.name}` : "Resource Assignment"}
                </DialogTitle>
              </DialogHeader>
              {selectedPerson && (
                <div className="space-y-4 py-4">
                  <div className="p-3 bg-gray-800 border border-gray-700 rounded-md">
                    <div className="font-medium text-white">{selectedPerson.name}</div>
                    <div className="text-sm text-gray-300">Occupation: {selectedPerson.occupation}</div>
                    <div className="text-sm text-gray-300">Contact: {selectedPerson.contact_number}</div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resources">Assign Resource</Label>
                    <Select
                      value={selectedResourceId}
                      onValueChange={setSelectedResourceId}
                      className="bg-gray-800 border-gray-700 text-white"
                    >
                      <SelectItem value="0">None</SelectItem>
                      {resources.map((resource) => (
                        <SelectItem key={resource.id} value={resource.id}>
                          {resource.name} ({resource.type})
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Assignment Notes</Label>
                    <Textarea
                      placeholder="Enter assignment details or special instructions"
                      value={assignmentNotes}
                      onChange={(e) => setAssignmentNotes(e.target.value)}
                      rows={4}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleUpdateAssignment}>Update Assignment</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Add Person Dialog */}
        <Dialog open={showAddPersonDialog} onOpenChange={setShowAddPersonDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Person</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="person-name">Name *</Label>
                <Input
                  id="person-name"
                  value={newPersonForm.name}
                  onChange={(e) => setNewPersonForm({ ...newPersonForm, name: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="person-occupation">Occupation *</Label>
                <Input
                  id="person-occupation"
                  value={newPersonForm.occupation}
                  onChange={(e) => setNewPersonForm({ ...newPersonForm, occupation: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="person-contact">Contact Number *</Label>
                <Input
                  id="person-contact"
                  value={newPersonForm.contact_number}
                  onChange={(e) => setNewPersonForm({ ...newPersonForm, contact_number: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleAddPerson}>Add Person</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Tabs>
    </div>
  )
}

export default ResourceManagement
