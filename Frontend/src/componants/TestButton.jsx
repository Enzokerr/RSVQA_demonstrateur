import React from "react";
import Button from "../components/Button/Button";

const TestButton = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center gap-6 bg-gray-100">
      
      <Button>Primary Button</Button>

      <Button variant="secondary">
        Secondary Button
      </Button>

      <Button variant="outline">
        Outline Button
      </Button>

      <Button size="lg">
        Large Button
      </Button>

      <Button variant="danger">
        Delete
      </Button>

      <Button fullWidth>
        Full Width Button
      </Button>

    </div>
  );
};

export default TestButton;