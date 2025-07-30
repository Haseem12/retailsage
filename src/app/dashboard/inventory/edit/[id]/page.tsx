import EditProductForm from "@/components/edit-product-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditProductPage({ params }: { params: { id: string } }) {
  const { id } = params;

  return (
    <Card className="max-w-2xl mx-auto border-yellow-500/50">
      <CardHeader>
        <CardTitle className="text-2xl text-yellow-400">Edit Product / Add Stock</CardTitle>
        <CardDescription>Update the product details and add new stock to your inventory.</CardDescription>
      </CardHeader>
      <CardContent>
        <EditProductForm productId={id} />
      </CardContent>
    </Card>
  );
}
