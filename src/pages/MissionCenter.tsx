import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trophy, Coins, ArrowLeft, ExternalLink } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Product = Database['public']['Tables']['offerwall_products']['Row'];
type Participation = Database['public']['Tables']['mission_participations']['Row'];

const MissionCenter = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);
    await Promise.all([
      loadProducts(),
      loadParticipations(),
      loadProfile()
    ]);
    setLoading(false);
  };

  const loadProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('total_points')
      .single();
    
    if (data) {
      setTotalPoints(data.total_points);
    }
  };

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('offerwall_products')
      .select('*')
      .eq('is_active', true)
      .order('reward_amount', { ascending: false });

    if (error) {
      toast({
        title: "오류",
        description: "미션을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
      return;
    }

    setProducts(data || []);
  };

  const loadParticipations = async () => {
    const { data } = await supabase
      .from('mission_participations')
      .select('*')
      .order('created_at', { ascending: false });

    setParticipations(data || []);
  };

  const getParticipationStatus = (productId: string) => {
    return participations.find(p => p.product_id === productId);
  };

  const handleStartMission = async (product: Product) => {
    const existing = getParticipationStatus(product.id);
    
    if (existing) {
      if (existing.status === 'rewarded') {
        toast({
          title: "이미 완료된 미션",
          description: "이미 보상을 받은 미션입니다.",
        });
        return;
      }
      
      window.open(product.link, '_blank');
      return;
    }

    const { error } = await supabase
      .from('mission_participations')
      .insert({
        user_id: user.id,
        product_id: product.id,
        status: 'in_progress',
      });

    if (error) {
      toast({
        title: "오류",
        description: "미션 시작에 실패했습니다.",
        variant: "destructive",
      });
      return;
    }

    window.open(product.link, '_blank');
    await loadParticipations();
    
    toast({
      title: "미션 시작",
      description: "새 창에서 미션을 완료해주세요.",
    });
  };

  const getStatusBadge = (status?: string) => {
    if (!status) {
      return <Badge variant="outline">시작 가능</Badge>;
    }
    
    const statusMap = {
      pending: { label: "대기중", variant: "secondary" as const },
      in_progress: { label: "진행중", variant: "default" as const },
      completed: { label: "완료", variant: "default" as const },
      rewarded: { label: "보상 지급됨", variant: "default" as const },
    };

    const config = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            홈으로
          </Button>
          
          <Button
            variant="outline"
            onClick={() => supabase.auth.signOut().then(() => navigate("/auth"))}
          >
            로그아웃
          </Button>
        </div>

        <div className="text-center mb-8">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-2">미션 센터</h1>
          <p className="text-muted-foreground">미션을 완료하고 포인트를 획득하세요</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-primary" />
              내 포인트
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{totalPoints.toLocaleString()}P</div>
          </CardContent>
        </Card>

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">진행 가능한 미션</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {products.map((product) => {
              const participation = getParticipationStatus(product.id);
              const isCompleted = participation?.status === 'rewarded';
              
              return (
                <Card key={product.id} className={isCompleted ? 'opacity-60' : ''}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{product.name}</CardTitle>
                        <CardDescription>{product.description}</CardDescription>
                      </div>
                      {product.image_url && (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded ml-4"
                        />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Coins className="w-5 h-5 text-primary" />
                          <span className="text-2xl font-bold text-primary">
                            {product.reward_amount.toLocaleString()}P
                          </span>
                        </div>
                        {getStatusBadge(participation?.status)}
                      </div>
                      
                      <div className="flex gap-2">
                        <Badge variant="outline">{product.category}</Badge>
                      </div>

                      {participation && participation.status !== 'rewarded' && (
                        <Progress value={participation.status === 'completed' ? 100 : 50} />
                      )}

                      <Button 
                        className="w-full gap-2"
                        onClick={() => handleStartMission(product)}
                        disabled={isCompleted}
                      >
                        <ExternalLink className="w-4 h-4" />
                        {participation ? '미션 계속하기' : '미션 시작'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionCenter;
