"use client";

import React from "react";
import { Button, Spinner, ButtonProps } from "@heroui/react";

interface PremiumButtonProps extends ButtonProps {
  isLoading?: boolean;
  spinner?: React.ReactNode;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
}

export function PremiumButton({ 
  children, 
  isLoading, 
  spinner, 
  startContent, 
  endContent, 
  isDisabled,
  ...props 
}: PremiumButtonProps) {
  return (
    <Button 
      {...props} 
      isDisabled={isDisabled || isLoading}
    >
      {isLoading ? (
        spinner || <Spinner size="sm" color="current" />
      ) : (
        <>
          {startContent}
          {children}
          {endContent}
        </>
      )}
    </Button>
  );
}
