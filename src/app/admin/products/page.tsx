
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit3, Trash2, Package, Search, ArrowLeft, UploadCloud } from 'lucide-react';
import Image from 'next/image';
import { formatCurrencyIDR } from '@/lib/utils';

const initialFormState: Omit<Product, 'id'> = {
  name: '',
  description: '',
  price: 0,
  category: '',
  imageUrl: '',
  stock: 0,
  dataAiHint: '',
};

export default function AdminProductsPage() {
  const { currentUser, products, addProduct, updateProduct, deleteProduct, getProductById, productCategories } = useAppContext();
  const router = useRouter();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Omit<Product, 'id'>>(initialFormState);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser?.role !== 'admin' && typeof window !== 'undefined') {
      router.push('/');
    }
  }, [currentUser, router]);

  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a,b) => a.name.localeCompare(b.name));
  }, [products, searchTerm]);

  if (currentUser?.role !== 'admin') {
    return <div className="flex justify-center items-center h-screen"><p>Access Denied. Redirecting...</p></div>;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'price' || name === 'stock' ? parseFloat(value) || 0 : value }));
  };
  
  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFormData(prev => ({ ...prev, imageUrl: result }));
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    } else {
      // If no file is selected, clear the preview and potentially the imageUrl if desired.
      // For now, retain existing imageUrl if user cancels file selection.
      // If editing, and user cancels, keep existing image. If new, and cancels, it's fine.
      if (!editingProduct) { // Only clear if it's a new product and they deselected
        setFormData(prev => ({ ...prev, imageUrl: initialFormState.imageUrl }));
        setImagePreview(null);
      }
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData(initialFormState);
    setImagePreview(null);
    setIsDialogOpen(true);
  };

  const handleEditProduct = (productId: string) => {
    const product = getProductById(productId);
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        imageUrl: product.imageUrl, // This could be a URL or a Data URI
        stock: product.stock,
        dataAiHint: product.dataAiHint || '',
      });
      setImagePreview(product.imageUrl); // Show current image
      setIsDialogOpen(true);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    setDeletingProductId(productId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteProduct = () => {
    if (deletingProductId) {
      deleteProduct(deletingProductId);
      setIsDeleteDialogOpen(false);
      setDeletingProductId(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category || formData.price <= 0 || formData.stock < 0 || !formData.imageUrl) {
      toast({ title: "Validation Error", description: "Please fill all required fields and upload an image.", variant: "destructive" });
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
    } else {
      addProduct(formData);
    }
    setIsDialogOpen(false);
    setEditingProduct(null);
    setFormData(initialFormState);
    setImagePreview(null);
  };
  
  const uniqueCategories = useMemo(() => {
    return ["", ...productCategories.filter(cat => cat && cat !== "All")];
  }, [productCategories]);


  return (
    <div className="container mx-auto py-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Admin
      </Button>
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center">
            <Package className="mr-3 h-10 w-10 text-primary" />
            <div>
                <h1 className="text-4xl font-bold tracking-tight text-foreground">Product Management</h1>
                <p className="mt-1 text-lg text-muted-foreground">Add, edit, or remove products from your store.</p>
            </div>
        </div>
        <Button onClick={handleAddProduct} className="mt-4 sm:mt-0">
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Product
        </Button>
      </header>

      <Card className="mb-8 shadow">
        <CardHeader>
            <CardTitle>Search Products</CardTitle>
            <CardDescription>Filter products by name or category.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search by name or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                />
            </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Product List</CardTitle>
          <CardDescription>Overview of all available products.</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No products found. {searchTerm && "Try adjusting your search."}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 hidden md:table-cell">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right hidden md:table-cell">Stock</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="hidden md:table-cell">
                      <Image src={product.imageUrl || 'https://placehold.co/40x40.png'} alt={product.name} width={40} height={40} className="rounded-md object-cover" data-ai-hint={product.dataAiHint || "product image"} />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="hidden sm:table-cell">{product.category}</TableCell>
                    <TableCell className="text-right">{formatCurrencyIDR(product.price)}</TableCell>
                    <TableCell className="text-right hidden md:table-cell">{product.stock}</TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product.id)} className="mr-2 hover:text-primary">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)} className="hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update the details of this product.' : 'Fill in the details for the new product.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (IDR)</Label>
                <Input id="price" name="price" type="number" value={formData.price} onChange={handleInputChange} required min="0.01" step="0.01" />
              </div>
              <div>
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleInputChange} required min="0" step="1" />
              </div>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
                <Select name="category" value={formData.category} onValueChange={handleCategoryChange}>
                    <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                        {uniqueCategories.map(cat => cat && ( 
                        <SelectItem key={cat} value={cat}>
                            {cat}
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
              <Label htmlFor="imageUpload">Product Image</Label>
              <Input id="imageUpload" name="imageUpload" type="file" accept="image/*" onChange={handleImageChange} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" />
              {imagePreview && (
                <div className="mt-2 relative w-full h-48">
                  <Image src={imagePreview} alt="Image Preview" layout="fill" objectFit="contain" className="rounded-md border" />
                </div>
              )}
               {!imagePreview && editingProduct?.imageUrl && (
                 <div className="mt-2 relative w-full h-48">
                  <Image src={editingProduct.imageUrl} alt="Current Image" layout="fill" objectFit="contain" className="rounded-md border" />
                </div>
               )}
            </div>
            <div>
              <Label htmlFor="dataAiHint">Data AI Hint (Optional, for image search)</Label>
              <Input id="dataAiHint" name="dataAiHint" value={formData.dataAiHint} onChange={handleInputChange} placeholder="e.g. electronics computer" />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">{editingProduct ? 'Save Changes' : 'Add Product'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the product: {deletingProductId ? getProductById(deletingProductId)?.name : ''}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDeleteProduct}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
