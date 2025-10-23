import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Plus, Users, Trophy, Coins } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Database } from "@/integrations/supabase/types";

type Product = Database['public']['Tables']['offerwall_products']['Row'];
type Participation = Database['public']['Tables']['mission_participations']['Row'] & {
  profiles?: { display_name: string | null };
  offerwall_products?: { name: string };
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalMissions: 0, totalRewards: 0 });

  // 신규 미션 등록 폼
  const [newMission, setNewMission] = useState({
    name: '',
    description: '',
    category: '',
    reward_amount: 0,
    link: '',
    image_url: '',
    keywords: '',
  });

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      toast({
        title: "접근 거부",
        description: "관리자 권한이 필요합니다.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setIsAdmin(true);
    await Promise.all([
      loadProducts(),
      loadParticipations(),
      loadStats()
    ]);
    setLoading(false);
  };

  const loadProducts = async () => {
    const { data } = await supabase
      .from('offerwall_products')
      .select('*')
      .order('created_at', { ascending: false });

    setProducts(data || []);
  };

  const loadParticipations = async () => {
    const { data } = await supabase
      .from('mission_participations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) {
      const withDetails = await Promise.all(
        data.map(async (p) => {
          const [profileRes, productRes] = await Promise.all([
            supabase.from('profiles').select('display_name').eq('id', p.user_id).single(),
            supabase.from('offerwall_products').select('name').eq('id', p.product_id).single(),
          ]);
          
          return {
            ...p,
            profiles: profileRes.data ? { display_name: profileRes.data.display_name } : undefined,
            offerwall_products: productRes.data ? { name: productRes.data.name } : undefined,
          };
        })
      );
      setParticipations(withDetails);
    }
  };

  const loadStats = async () => {
    const [usersRes, participationsRes, rewardsRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('mission_participations').select('id', { count: 'exact', head: true }),
      supabase.from('user_rewards').select('amount'),
    ]);

    const totalRewards = rewardsRes.data?.reduce((sum, r) => sum + r.amount, 0) || 0;

    setStats({
      totalUsers: usersRes.count || 0,
      totalMissions: participationsRes.count || 0,
      totalRewards,
    });
  };

  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from('offerwall_products')
      .insert({
        name: newMission.name,
        description: newMission.description,
        category: newMission.category,
        reward_amount: newMission.reward_amount,
        link: newMission.link,
        image_url: newMission.image_url || null,
        keywords: newMission.keywords ? newMission.keywords.split(',').map(k => k.trim()) : null,
        is_active: true,
      });

    if (error) {
      toast({
        title: "오류",
        description: "미션 등록에 실패했습니다.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "성공",
      description: "새 미션이 등록되었습니다.",
    });

    setNewMission({
      name: '',
      description: '',
      category: '',
      reward_amount: 0,
      link: '',
      image_url: '',
      keywords: '',
    });

    await loadProducts();
  };

  const handleUpdateParticipation = async (id: string, status: string) => {
    const { error } = await supabase
      .from('mission_participations')
      .update({ 
        status: status as any,
        completed_at: status === 'completed' ? new Date().toISOString() : null,
        rewarded_at: status === 'rewarded' ? new Date().toISOString() : null,
      })
      .eq('id', id);

    if (error) {
      toast({
        title: "오류",
        description: "상태 업데이트에 실패했습니다.",
        variant: "destructive",
      });
      return;
    }

    if (status === 'rewarded') {
      const participation = participations.find(p => p.id === id);
      if (participation) {
        const product = products.find(p => p.id === participation.product_id);
        if (product) {
          await supabase.from('user_rewards').insert({
            user_id: participation.user_id,
            participation_id: id,
            amount: product.reward_amount,
            description: `${product.name} 미션 완료`,
          });

          const { data: profile } = await supabase
            .from('profiles')
            .select('total_points')
            .eq('id', participation.user_id)
            .single();

          if (profile) {
            await supabase
              .from('profiles')
              .update({ total_points: profile.total_points + product.reward_amount })
              .eq('id', participation.user_id);
          }
        }
      }
    }

    toast({
      title: "성공",
      description: "상태가 업데이트되었습니다.",
    });

    await loadParticipations();
    await loadStats();
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
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            홈으로
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">관리자 대시보드</h1>
          <p className="text-muted-foreground">미션 및 사용자 관리</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">총 사용자</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">총 미션 참여</CardTitle>
              <Trophy className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMissions}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">총 지급 보상</CardTitle>
              <Coins className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRewards.toLocaleString()}P</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>미션 관리</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      신규 미션
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>신규 미션 등록</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateMission} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">미션명</Label>
                        <Input
                          id="name"
                          value={newMission.name}
                          onChange={(e) => setNewMission({ ...newMission, name: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">설명</Label>
                        <Textarea
                          id="description"
                          value={newMission.description}
                          onChange={(e) => setNewMission({ ...newMission, description: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="category">카테고리</Label>
                          <Input
                            id="category"
                            value={newMission.category}
                            onChange={(e) => setNewMission({ ...newMission, category: e.target.value })}
                            placeholder="예: 앱설치, 회원가입"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="reward">보상 포인트</Label>
                          <Input
                            id="reward"
                            type="number"
                            value={newMission.reward_amount}
                            onChange={(e) => setNewMission({ ...newMission, reward_amount: parseInt(e.target.value) })}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="link">미션 링크</Label>
                        <Input
                          id="link"
                          type="url"
                          value={newMission.link}
                          onChange={(e) => setNewMission({ ...newMission, link: e.target.value })}
                          placeholder="https://"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="image">이미지 URL (선택)</Label>
                        <Input
                          id="image"
                          type="url"
                          value={newMission.image_url}
                          onChange={(e) => setNewMission({ ...newMission, image_url: e.target.value })}
                          placeholder="https://"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="keywords">키워드 (쉼표로 구분)</Label>
                        <Input
                          id="keywords"
                          value={newMission.keywords}
                          onChange={(e) => setNewMission({ ...newMission, keywords: e.target.value })}
                          placeholder="금융, 대출, 카드"
                        />
                      </div>

                      <Button type="submit" className="w-full">미션 등록</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {products.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">{product.reward_amount}P</div>
                    </div>
                    <Badge variant={product.is_active ? "default" : "secondary"}>
                      {product.is_active ? "활성" : "비활성"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>미션 참여 현황</CardTitle>
              <CardDescription>최근 50개 참여 내역</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>사용자</TableHead>
                    <TableHead>미션</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participations.slice(0, 10).map((participation) => (
                    <TableRow key={participation.id}>
                      <TableCell>{participation.profiles?.display_name || 'Unknown'}</TableCell>
                      <TableCell>{participation.offerwall_products?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{participation.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={participation.status}
                          onValueChange={(value) => handleUpdateParticipation(participation.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">대기중</SelectItem>
                            <SelectItem value="in_progress">진행중</SelectItem>
                            <SelectItem value="completed">완료</SelectItem>
                            <SelectItem value="rewarded">보상지급</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
