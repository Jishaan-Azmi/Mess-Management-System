import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useMessItems } from "@/hooks/useMessItems";

const AdminMessItems = () => {
  const navigate = useNavigate();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", category: "", price: "" });
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { messItems, loading, addMessItem, updateMessItem, deleteMessItem } = useMessItems();

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.price) {
      toast.error("Please fill all fields");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await addMessItem({
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price)
      });
      toast.success("Mess item added successfully!");
      setFormData({ name: "", category: "", price: "" });
      setIsAddDialogOpen(false);
    } catch (error) {
      toast.error("Failed to add item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setFormData({ name: item.name, category: item.category, price: item.price.toString() });
    setIsEditDialogOpen(true);
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.price) {
      toast.error("Please fill all fields");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await updateMessItem(editingItem.id, {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price)
      });
      toast.success("Item updated successfully!");
      setFormData({ name: "", category: "", price: "" });
      setIsEditDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      toast.error("Failed to update item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (item: any) => {
    if (item.name === 'Thali') {
      toast.error("Cannot delete default Thali item");
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
      try {
        await deleteMessItem(item.id);
        toast.success(`${item.name} removed from menu`);
      } catch (error) {
        toast.error("Failed to delete item");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/admin/dashboard")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mess Items Management</h1>
            <p className="text-muted-foreground">Manage food items and pricing</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Mess Item</DialogTitle>
                <DialogDescription>Enter item details to add to the menu</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddItem} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="item-name">Item Name</Label>
                  <Input 
                    id="item-name" 
                    placeholder="Enter item name" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-category">Category</Label>
                  <Input 
                    id="item-category" 
                    placeholder="e.g., Morning, Afternoon" 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-price">Price (₹)</Label>
                  <Input 
                    id="item-price" 
                    type="number" 
                    placeholder="Enter price" 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Item"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Mess Item</DialogTitle>
                <DialogDescription>Update item details</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateItem} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-item-name">Item Name</Label>
                  <Input 
                    id="edit-item-name" 
                    placeholder="Enter item name" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    disabled={editingItem?.name === 'Thali'}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-item-category">Category</Label>
                  <Input 
                    id="edit-item-category" 
                    placeholder="e.g., Morning, Afternoon" 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    disabled={editingItem?.name === 'Thali'}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-item-price">Price (₹)</Label>
                  <Input 
                    id="edit-item-price" 
                    type="number" 
                    placeholder="Enter price" 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Item"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="p-6 mb-6 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Items</p>
              <p className="text-2xl font-bold">{messItems.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Avg. Price</p>
              <p className="text-2xl font-bold">
                ₹{Math.round(messItems.reduce((acc, item) => acc + item.price, 0) / messItems.length)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Daily Revenue Potential</p>
              <p className="text-2xl font-bold">
                ₹{messItems.reduce((acc, item) => acc + item.price, 0) * 250}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading items...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="font-semibold">₹{item.price}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => handleEditItem(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteItem(item)}
                          disabled={item.name === 'Thali'}
                        >
                          <Trash2 className={`w-4 h-4 ${item.name === 'Thali' ? 'text-muted-foreground' : 'text-destructive'}`} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {messItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No items found. Add your first mess item to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminMessItems;
