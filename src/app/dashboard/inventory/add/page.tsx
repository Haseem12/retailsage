import AddProductForm from "@/components/add-product-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AddProductPage() {
  return (
      <Card className="max-w-2xl mx-auto border-green-500/50">
        <CardHeader>
          <CardTitle className="text-2xl text-green-400">Add New Product</CardTitle>
          <CardDescription>Fill in the details below to add a new product to your inventory. Use the AI assistant to help you with categories and descriptions.</CardDescription>
        </CardHeader>
        <CardContent>
          <AddProductForm />
        </CardContent>
      </Card>
  );
}
