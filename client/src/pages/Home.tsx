import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import ProductSubmissionForm from "@/components/ProductSubmissionForm";
import ProductsView from "@/components/ProductsView";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [activeTab, setActiveTab] = useState("submission");
  const { toast } = useToast();

  const handleProductAdded = () => {
    toast({
      title: "Success",
      description: "Product added successfully!",
      variant: "success",
      duration: 3000,
    });
  };

  return (
    <div className="bg-gray-50 font-sans min-h-screen">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs 
          defaultValue="submission" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="mb-8 border-b border-gray-200">
            <TabsList className="flex space-x-8 bg-transparent">
              <TabsTrigger 
                value="submission" 
                className="py-4 px-1 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap focus:outline-none bg-transparent"
              >
                Product Submission
              </TabsTrigger>
              <TabsTrigger 
                value="products" 
                className="py-4 px-1 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap focus:outline-none bg-transparent"
              >
                My Products
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="submission" className="mt-0">
            <ProductSubmissionForm onProductAdded={(newProduct) => {
              handleProductAdded();
              // Immediately switch to products tab to see new product
              setActiveTab("products");
            }} />
          </TabsContent>
          
          <TabsContent value="products" className="mt-0">
            <ProductsView onAddFirstProduct={() => setActiveTab("submission")} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
