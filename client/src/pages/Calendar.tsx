import { useState, useEffect, useMemo } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth } from "date-fns";
import { enUS } from "date-fns/locale";
import { driverApi, type Driver } from "../services/api";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../styles/calendar.css";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    driver: Driver;
    daysUntilExpiry: number;
    status: "expired" | "critical" | "warning" | "normal";
  };
}

const Calendar = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [view, setView] = useState<typeof Views[keyof typeof Views]>(Views.MONTH);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await driverApi.getAllDrivers({ limit: 1000 });
      setDrivers(response.data);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Convert drivers to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    return drivers.map((driver) => {
      const expiryDate = new Date(driver.licenseExpiry);
      const today = new Date();
      const daysUntilExpiry = Math.ceil(
        (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      let status: "expired" | "critical" | "warning" | "normal";
      if (daysUntilExpiry < 0) {
        status = "expired";
      } else if (daysUntilExpiry <= 7) {
        status = "critical";
      } else if (daysUntilExpiry <= 30) {
        status = "warning";
      } else {
        status = "normal";
      }

      return {
        id: driver._id || "",
        title: `${driver.name} - License Expires`,
        start: expiryDate,
        end: expiryDate,
        resource: {
          driver,
          daysUntilExpiry,
          status,
        },
      };
    });
  }, [drivers]);

  // Filter events for current view
  const visibleEvents = useMemo(() => {
    if (view === Views.MONTH) {
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      return events.filter(
        (event) =>
          event.start >= monthStart && event.start <= monthEnd
      );
    }
    return events;
  }, [events, date, view]);

  // Stats for the legend
  const stats = useMemo(() => {
    return {
      expired: events.filter((e) => e.resource.status === "expired").length,
      critical: events.filter((e) => e.resource.status === "critical").length,
      warning: events.filter((e) => e.resource.status === "warning").length,
      total: events.length,
    };
  }, [events]);

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = "#3b82f6"; // default blue

    switch (event.resource.status) {
      case "expired":
        backgroundColor = "#ef4444"; // red
        break;
      case "critical":
        backgroundColor = "#f97316"; // orange
        break;
      case "warning":
        backgroundColor = "#eab308"; // yellow
        break;
      case "normal":
        backgroundColor = "#10b981"; // green
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "5px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block",
        fontSize: "0.875rem",
        padding: "2px 5px",
      },
    };
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  const handleViewChange = (newView: typeof Views[keyof typeof Views]) => {
    setView(newView);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            License Expiration Calendar
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Visual overview of all driver license expirations
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="shrink-0">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                Expired
              </p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-200">
                {stats.expired}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="shrink-0">
              <div className="h-3 w-3 rounded-full bg-orange-500"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                Critical (≤7 days)
              </p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-200">
                {stats.critical}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="shrink-0">
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                Warning (≤30 days)
              </p>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-200">
                {stats.warning}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="shrink-0">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                Total Tracked
              </p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-200">
                {stats.total}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
        <div className="calendar-container" style={{ height: "700px" }}>
          <BigCalendar
            localizer={localizer}
            events={visibleEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={handleSelectEvent}
            onNavigate={handleNavigate}
            onView={handleViewChange}
            view={view}
            date={date}
            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
            popup
          />
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Driver Details
              </h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Status Badge */}
              <div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    selectedEvent.resource.status === "expired"
                      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      : selectedEvent.resource.status === "critical"
                      ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                      : selectedEvent.resource.status === "warning"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                      : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  }`}
                >
                  {selectedEvent.resource.status === "expired"
                    ? "Expired"
                    : selectedEvent.resource.status === "critical"
                    ? "Critical"
                    : selectedEvent.resource.status === "warning"
                    ? "Warning"
                    : "Active"}
                </span>
              </div>

              {/* Driver Info */}
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Name
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedEvent.resource.driver.name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Email
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {selectedEvent.resource.driver.email}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    License Number
                  </p>
                  <p className="text-gray-900 dark:text-white font-mono">
                    {selectedEvent.resource.driver.licenseNumber}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    License Class
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {selectedEvent.resource.driver.licenseClass}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Expiry Date
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {format(
                      new Date(selectedEvent.resource.driver.licenseExpiry),
                      "MMMM dd, yyyy"
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Days Until Expiry
                  </p>
                  <p
                    className={`text-lg font-bold ${
                      selectedEvent.resource.daysUntilExpiry < 0
                        ? "text-red-600 dark:text-red-400"
                        : selectedEvent.resource.daysUntilExpiry <= 7
                        ? "text-orange-600 dark:text-orange-400"
                        : selectedEvent.resource.daysUntilExpiry <= 30
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-green-600 dark:text-green-400"
                    }`}
                  >
                    {selectedEvent.resource.daysUntilExpiry < 0
                      ? `Expired ${Math.abs(
                          selectedEvent.resource.daysUntilExpiry
                        )} days ago`
                      : `${selectedEvent.resource.daysUntilExpiry} days`}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <a
                  href={`/drivers/${selectedEvent.resource.driver._id}`}
                  className="block w-full text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition"
                >
                  View Full Profile
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
