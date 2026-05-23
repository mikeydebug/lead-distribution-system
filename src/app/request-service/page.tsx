"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const leadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  city: z.string().min(2, "City must be at least 2 characters"),
  serviceId: z.coerce.number().int().min(1).max(3),
});

type LeadFormValues = z.infer<typeof leadSchema>;

export default function RequestServicePage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      serviceId: 1,
    },
  });

  const onSubmit = async (data: LeadFormValues) => {
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to submit lead");
      }

      setStatus("success");
      setMessage("Your request has been submitted successfully. Providers have been assigned.");
      reset();
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="bg-gray-900 rounded-2xl shadow-xl border border-gray-800 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Request a Service</h1>
          <p className="mt-2 text-gray-400">Fill out the form below to get connected with our premium providers.</p>
        </div>

        {status === "success" && (
          <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex items-start">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-emerald-300">{message}</p>
          </div>
        )}

        {status === "error" && (
          <div className="mb-6 bg-rose-500/10 border border-rose-500/20 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-rose-300">{message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <input
                id="name"
                {...register("name")}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                placeholder="John Doe"
              />
              {errors.name && <p className="mt-1 text-sm text-rose-400">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
              <input
                id="phone"
                {...register("phone")}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                placeholder="9999999999"
              />
              {errors.phone && <p className="mt-1 text-sm text-rose-400">{errors.phone.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-2">City</label>
            <input
              id="city"
              {...register("city")}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
              placeholder="New York"
            />
            {errors.city && <p className="mt-1 text-sm text-rose-400">{errors.city.message}</p>}
          </div>

          <div>
            <label htmlFor="serviceId" className="block text-sm font-medium text-gray-300 mb-2">Service Required</label>
            <select
              id="serviceId"
              {...register("serviceId")}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none appearance-none"
            >
              <option value={1}>Service 1</option>
              <option value={2}>Service 2</option>
              <option value={3}>Service 3</option>
            </select>
            {errors.serviceId && <p className="mt-1 text-sm text-rose-400">{errors.serviceId.message}</p>}
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {status === "loading" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Submit Request"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
