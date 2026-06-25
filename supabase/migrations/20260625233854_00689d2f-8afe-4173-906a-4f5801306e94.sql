-- Fix: restore EXECUTE on has_role for authenticated users (template selection RLS uses it)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.super_admin_exists() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.claim_super_admin() TO authenticated;