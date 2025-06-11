"use client";
import { Button, Card, CardBody, CardHeader } from "@heroui/react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ExpressThat
          </h1>
          <p className="text-lg text-gray-600">
            A modern system built with Next.js, TypeScript, Tailwind CSS, and HeroUI
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-4">
            <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
              <h4 className="font-bold text-large">Next.js 15</h4>
              <small className="text-default-500">App Router</small>
            </CardHeader>
            <CardBody className="overflow-visible py-2">
              <p className="text-small text-default-500">
                Built with the latest Next.js App Router for optimal performance and developer experience.
              </p>
            </CardBody>
          </Card>

          <Card className="p-4">
            <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
              <h4 className="font-bold text-large">TypeScript</h4>
              <small className="text-default-500">Type Safety</small>
            </CardHeader>
            <CardBody className="overflow-visible py-2">
              <p className="text-small text-default-500">
                Full TypeScript support for better development experience and fewer runtime errors.
              </p>
            </CardBody>
          </Card>

          <Card className="p-4">
            <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
              <h4 className="font-bold text-large">HeroUI</h4>
              <small className="text-default-500">UI Framework</small>
            </CardHeader>
            <CardBody className="overflow-visible py-2">
              <p className="text-small text-default-500">
                Beautiful, accessible components built on top of Tailwind CSS.
              </p>
            </CardBody>
          </Card>
        </div>

        <div className="text-center mt-12">
          <Button 
            color="primary" 
            size="lg"
            className="mr-4"
          >
            Get Started
          </Button>
          <Button 
            variant="bordered" 
            size="lg"
          >
            Learn More
          </Button>
        </div>
      </div>
    </div>
  );
}
