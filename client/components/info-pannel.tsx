"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

export const InfoPannel = () => {
  return (
    <div className="w-full px-96 mx-60">
      <Card>
        <CardHeader>
          <CardTitle>Info Panel</CardTitle>
          <CardDescription>Complete details about Client.</CardDescription>
        </CardHeader>
        <CardContent>
          <div>Card Content</div>
        </CardContent>
      </Card>
    </div>
  );
};
