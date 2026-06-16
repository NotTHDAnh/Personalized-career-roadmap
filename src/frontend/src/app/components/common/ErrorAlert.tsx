import { AlertCircle, RotateCcw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert";
import { Button } from "@/app/components/ui/button";

interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorAlert({ title = "Error", message, onRetry }: ErrorAlertProps) {
  return (
    <div className="p-4 w-full">
      <Alert variant="destructive" className="border-red-200/50 bg-red-50/50 text-red-800">
        <AlertCircle className="w-4 h-4 text-red-600" />
        <AlertTitle className="font-semibold text-red-900">{title}</AlertTitle>
        <AlertDescription className="text-red-700/90 mt-1 flex flex-col items-start gap-3">
          <p>{message}</p>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-1 flex items-center gap-1.5 border-red-200 bg-white hover:bg-red-50 text-red-800 hover:text-red-900 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Retry
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}
