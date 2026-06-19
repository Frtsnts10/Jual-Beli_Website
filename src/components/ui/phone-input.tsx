import React, { useState, useEffect } from "react";
import { Input } from "@heroui/react";
import { ChevronDown } from "lucide-react";
import { COUNTRY_CODES } from "@/config/countries";

interface PhoneInputProps {
  value: string;
  onChange: (val: string) => void;
  isRequired?: boolean;
  placeholder?: string;
}

export function PhoneInput({
  value,
  onChange,
  isRequired = false,
  placeholder = "812-3456-7890",
}: PhoneInputProps) {
  // Parse initial value to extract country code and phone part
  const [countryCode, setCountryCode] = useState("+62");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isOpenCountry, setIsOpenCountry] = useState(false);

  useEffect(() => {
    if (!value) {
      setPhoneNumber("");
      return;
    }
    const match = value.match(/^(\\+\\d+)\\s+(.*)$/);
    if (match) {
      setCountryCode(match[1]);
      setPhoneNumber(match[2].replace(/^0+/, ""));
    } else {
      // If it doesn't match the format, just assume it's all phone number
      if (value.startsWith("+")) {
        const spaceIdx = value.indexOf(" ");
        if (spaceIdx > -1) {
          setCountryCode(value.substring(0, spaceIdx));
          setPhoneNumber(value.substring(spaceIdx + 1).replace(/^0+/, ""));
        } else {
          setPhoneNumber(value.replace(/^0+/, ""));
        }
      } else {
        setPhoneNumber(value.replace(/^0+/, ""));
      }
    }
  }, [value]);

  const handlePhoneChange = (val: string) => {
    const strippedVal = val.replace(/^0+/, "");
    setPhoneNumber(strippedVal);
    onChange(`${countryCode} ${strippedVal.trim()}`);
  };

  const handleCountryChange = (code: string) => {
    setCountryCode(code);
    setIsOpenCountry(false);
    onChange(`${code} ${phoneNumber.trim()}`);
  };

  const activeCountry = COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];

  const startContent = (
    <div className="relative flex items-center pr-2 border-r border-zinc-200 dark:border-zinc-800">
      <button
        type="button"
        onClick={() => setIsOpenCountry(!isOpenCountry)}
        className="flex items-center gap-1.5 px-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
      >
        <span className="text-sm">{activeCountry.flag}</span>
        <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
          {countryCode}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-zinc-400 transition-transform ${
            isOpenCountry ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpenCountry && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpenCountry(false)}
          />
          <div className="absolute top-[120%] left-0 z-50 w-64 max-h-56 overflow-y-auto bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-lg shadow-xl py-1">
            {COUNTRY_CODES.map((item) => {
              const isSelected = item.code === countryCode;
              return (
                <button
                  key={item.code + item.country}
                  type="button"
                  onClick={() => handleCountryChange(item.code)}
                  className={`w-full px-3 py-1.5 text-left text-xs flex items-center gap-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors ${
                    isSelected
                      ? "bg-indigo-50/50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold"
                      : "text-zinc-700 dark:text-zinc-400 font-medium"
                  }`}
                >
                  <span className="text-sm">{item.flag}</span>
                  <span className="font-bold w-10 shrink-0 text-white">{item.code}</span>
                  <span className="text-zinc-500 truncate">
                    {item.country}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="relative flex items-center w-full">
      <div className="absolute left-0 z-10 h-full flex items-center pl-3">
        {startContent}
      </div>
      <Input
        type="tel"
        placeholder={placeholder}
        required={isRequired}
        value={phoneNumber}
        onChange={(e) => handlePhoneChange(e.target.value)}
        color="secondary"
        className="[&_input]:pl-[84px]"
      />
    </div>
  );
}
