-- Drop old policies
DROP POLICY IF EXISTS "Anyone can view active products" ON public.offerwall_products;
DROP POLICY IF EXISTS "Authenticated users can view active products" ON public.offerwall_products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.offerwall_products;

-- Create correct policies for products
CREATE POLICY "Authenticated users can view active products"
  ON public.offerwall_products
  FOR SELECT
  USING (is_active = true AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage all products"
  ON public.offerwall_products
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));