"use client";

import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import { User, FieldTrip } from "../types";

interface FieldTripModalProps {
  user: User;
  onClose: () => void;
  onSave: (employeeNumber: string, fieldTrips: FieldTrip[]) => void;
}

export default function FieldTripModal({
  user,
  onClose,
  onSave,
}: FieldTripModalProps) {
  const [fieldTrips, setFieldTrips] = useState<FieldTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTrip, setNewTrip] = useState<FieldTrip>({
    startDate: "",
    endDate: "",
    description: "",
  });

  useEffect(() => {
    const fetchFieldTrips = async () => {
      try {
        const response = await api.get(`/field-trips/${user.employeeNumber}`);

        if (response.success && response.data?.fieldTrips) {
          setFieldTrips(
            response.data.fieldTrips.map((trip: any) => ({
              startDate: trip.startDate.split("T")[0],
              endDate: trip.endDate.split("T")[0],
              description: trip.description || "",
            })),
          );
        } else {
          setFieldTrips([]);
        }
      } catch (err) {
        console.error("Error fetching field trips:", err);
        setFieldTrips([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFieldTrips();
  }, [user.employeeNumber]);

  const handleAddTrip = () => {
    if (newTrip.startDate && newTrip.endDate) {
      const startDate = new Date(newTrip.startDate);
      const endDate = new Date(newTrip.endDate);

      if (startDate > endDate) {
        alert("End date must be after start date");
        return;
      }

      setFieldTrips([...fieldTrips, { ...newTrip }]);
      setNewTrip({ startDate: "", endDate: "", description: "" });
    } else {
      alert("Please fill in both start and end dates");
    }
  };

  const handleRemoveTrip = (index: number) => {
    setFieldTrips(fieldTrips.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      const response = await api.put("/field-trips", {
        employeeNumber: user.employeeNumber,
        fieldTripDates: fieldTrips,
      });

      if (response.success) {
        alert("Field trips saved successfully!");
        onSave(user.employeeNumber, fieldTrips);
        onClose();
      } else {
        throw new Error(response.error || "Failed to save field trips");
      }
    } catch (error) {
      console.error("Error saving field trips:", error);
      alert("Failed to save field trips. Please try again.");
    }
  };

  const isCurrentlyOnTrip = (trip: FieldTrip): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    return today >= startDate && today <= endDate;
  };

  return (
    <div
      className="modal"
      onClick={(e) => {
        if ((e.target as HTMLElement).classList.contains("modal")) onClose();
      }}
    >
      <div className="modal-content">
        <div className="modal-header">
          <h2>Manage Field Trips - {user.username}</h2>
          <button className="text-2xl" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="p-4 bg-gray-50 border border-black">
            <p>
              <strong>Employee Number:</strong> {user.employeeNumber}
            </p>
            <p>
              <strong>Projects:</strong>{" "}
              {user.projects.map((p) => p.projectCode).join(", ")}
            </p>
          </div>

          {loading ? (
            <p>Loading field trips…</p>
          ) : (
            <>
              <div className="p-4 border border-black space-y-4">
                <h3 className="text-lg font-bold">Schedule New Field Trip</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label htmlFor="startDate" className="mb-1 font-semibold">
                      Start Date
                    </label>
                    <input
                      id="startDate"
                      type="date"
                      className="p-2 border border-black"
                      value={newTrip.startDate}
                      onChange={(e) =>
                        setNewTrip({ ...newTrip, startDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="endDate" className="mb-1 font-semibold">
                      End Date
                    </label>
                    <input
                      id="endDate"
                      type="date"
                      className="p-2 border border-black"
                      value={newTrip.endDate}
                      min={newTrip.startDate}
                      onChange={(e) =>
                        setNewTrip({ ...newTrip, endDate: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label htmlFor="description" className="mb-1 font-semibold">
                    Description (Optional)
                  </label>
                  <input
                    id="description"
                    type="text"
                    className="p-2 border border-black"
                    value={newTrip.description}
                    onChange={(e) =>
                      setNewTrip({ ...newTrip, description: e.target.value })
                    }
                    placeholder="e.g., Client visit, Training"
                  />
                </div>
                <button className="btn" onClick={handleAddTrip}>
                  Schedule Field Trip
                </button>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-bold">Scheduled Field Trips</h3>
                {fieldTrips.length === 0 ? (
                  <p className="p-4 bg-gray-50 border border-black">
                    No field trips scheduled
                  </p>
                ) : (
                  <div className="space-y-2">
                    {fieldTrips.map((trip, index) => (
                      <div
                        key={index}
                        className={`flex justify-between items-center p-3 border border-black ${isCurrentlyOnTrip(trip) ? "bg-blue-100" : "bg-white"}`}
                      >
                        <div className="flex-grow">
                          <span className="font-mono">
                            {new Date(trip.startDate).toLocaleDateString()} -{" "}
                            {new Date(trip.endDate).toLocaleDateString()}
                          </span>
                          {trip.description && (
                            <span className="ml-4 text-gray-600 italic">
                              {trip.description}
                            </span>
                          )}
                          {isCurrentlyOnTrip(trip) && (
                            <span className="ml-4 px-2 py-1 text-xs font-bold text-white bg-blue-600">
                              ACTIVE NOW
                            </span>
                          )}
                        </div>
                        <button
                          className="px-3 py-1 bg-red-500 text-white font-bold border border-black hover:bg-red-600"
                          onClick={() => handleRemoveTrip(index)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end items-center gap-4 pt-4 border-t-2 border-black">
                <button className="btn bg-gray-200" onClick={onClose}>
                  Cancel
                </button>
                <button
                  className="btn bg-black text-white"
                  onClick={handleSave}
                >
                  Save Field Trips
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
