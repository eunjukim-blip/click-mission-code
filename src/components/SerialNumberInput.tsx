import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Key, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  generateUserIdentifier,
  setUserIdentifier,
  isValidUserIdentifier,
  formatUserIdentifier,
} from "@/lib/userIdentifier";

interface SerialNumberInputProps {
  onSuccess: () => void;
}

export const SerialNumberInput = ({ onSuccess }: SerialNumberInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = () => {
    const newIdentifier = generateUserIdentifier();
    setUserIdentifier(newIdentifier);
    toast.success("새로운 시리얼 넘버가 생성되었습니다!");
    onSuccess();
  };

  const handleSubmit = () => {
    const cleanedInput = inputValue.replace(/-/g, "").toUpperCase();
    
    if (!isValidUserIdentifier(cleanedInput)) {
      toast.error("올바른 형식이 아닙니다. 24자리 영문 대문자와 숫자만 입력 가능합니다.");
      return;
    }

    setUserIdentifier(cleanedInput);
    toast.success("시리얼 넘버가 등록되었습니다!");
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Key className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">시리얼 넘버 입력</CardTitle>
          <CardDescription>
            기존 시리얼 넘버를 입력하거나 새로 생성하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">시리얼 넘버</label>
            <Input
              placeholder="XXXXXX-XXXXXX-XXXXXX-XXXXXX"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value.toUpperCase())}
              maxLength={29} // 24 + 3 hyphens
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              24자리 영문 대문자와 숫자 (하이픈 자동 제거)
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={inputValue.length === 0 || isLoading}
            className="w-full"
            size="lg"
          >
            입력
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                또는
              </span>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            새 시리얼 넘버 생성
          </Button>

          <div className="text-xs text-muted-foreground text-center mt-4">
            시리얼 넘버는 안전하게 보관하세요. 분실 시 데이터를 복구할 수 없습니다.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
