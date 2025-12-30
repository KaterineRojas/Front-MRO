import React, { useState, useMemo } from 'react';
import { Package, Search, Plus, ExternalLink } from 'lucide-react';
import { Button } from '../../inventory/components/Button';
import { Badge } from '../../inventory/components/Badge';
import { Article, ArticleSelectorProps} from '../types/purchase'
import {getCategoryVariant} from '../CreatePurchaseRequestPage'
import { useSelector } from 'react-redux';



export const ArticleSelector: React.FC<ArticleSelectorProps> = ({
    articles,
    onAddItem
}) => {
    // --- STATE ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedArticleCode, setSelectedArticleCode] = useState<string | null>(null);
    const darkMode = useSelector((state: any) => state.ui.darkMode);

    

    const [formState, setFormState] = useState({
        quantity: '',
        estimatedCost: '',
        purchaseUrl: ''
    });

    // --- DERIVED STATE ---
    const filteredArticles = useMemo(() => {
        if (!searchTerm) return articles;

        const lowerTerm = searchTerm.toLowerCase();
        return articles.filter(article =>
            article.code.toLowerCase().includes(lowerTerm) ||
            article.description.toLowerCase().includes(lowerTerm) ||
            article.category.toLowerCase().includes(lowerTerm)
        );
    }, [searchTerm, articles]);

    const selectedArticle = useMemo(() =>
        articles.find(a => a.code === selectedArticleCode),
        [selectedArticleCode, articles]
    );

    // --- HANDLERS ---
    const handleSelectArticle = (article: Article) => {
        setSelectedArticleCode(article.code);
        setFormState({
            quantity: '',
            estimatedCost: article.cost.toString(),
            purchaseUrl: ''
        });
    };

    const handleSubmit = () => {
        if (!selectedArticle || !formState.quantity || !formState.estimatedCost) return;

        onAddItem({
            articleCode: selectedArticle.code,
            quantity: parseInt(formState.quantity),
            estimatedCost: parseFloat(formState.estimatedCost),
            purchaseUrl: formState.purchaseUrl,
            description: selectedArticle.description,
            unit: selectedArticle.unit,
            imageUrl: selectedArticle.imageUrl
        });

        // Reset Form
        setSelectedArticleCode(null);
        setFormState({ quantity: '', estimatedCost: '', purchaseUrl: '' });
    };

    const calculateTotal = () => {
        const q = parseFloat(formState.quantity) || 0;
        const c = parseFloat(formState.estimatedCost) || 0;
        return (q * c).toFixed(2);
    };

    // --- STYLES ---
    const inputClass = "flex h-9 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:border-gray-800 dark:focus:ring-gray-300";
    const labelClass = "text-sm font-medium leading-none mb-2 block text-gray-900 dark:text-gray-100";

    return (
        <div className="rounded-xl border border-gray-200 bg-white text-gray-950 shadow-sm dark:border-gray-800 dark:bg-transparent dark:text-gray-50 flex flex-col h-full">

            {/* HEADER */}
            <div className="flex flex-col space-y-1.5 p-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="font-semibold leading-none tracking-tight flex items-center text-lg">
                    <Package className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                    Catalogue
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Select items from the list below.
                </p>
            </div>

            <div className="p-6 space-y-6">

                {/* 1. SEARCH INPUT */}
                <div>
                    <div className="relative ">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Filter by name, code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`${inputClass} pl-9 dark:bg-[#121212]`}
                        />
                    </div>

                    <div className="mt-4 border rounded-md bg-white dark:bg-transparent dark:border-gray-800 h-[240px] overflow-y-auto">
                        {filteredArticles.length === 0 ? (
                            <div className="p-8 text-sm text-gray-500 text-center flex flex-col items-center">
                                <Package className="h-8 w-8 mb-2 text-gray-300" />
                                No articles match your search
                            </div>
                        ) : (
                            filteredArticles.map((article) => (
                                <div
                                    key={article.code}
                                    onClick={() => handleSelectArticle(article)}
                                    className={`flex items-start gap-3 p-3 cursor-pointer border-b last:border-0 border-gray-100 dark:border-gray-800 transition-colors ${selectedArticleCode === article.code
                                        ? 'bg-indigo-50 dark:bg-[#1F2937]'
                                        : 'hover:bg-gray-50 dark:hover:bg-[#191f26]'
                                        }
                                    `}
                                    
                                >
                                    {/* Image */}
                                    <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700 mt-1">
                                        {article.imageUrl ? (
                                            <img src={article.imageUrl} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <Package className="h-6 w-6 text-gray-400" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`font-semibold text-sm truncate pr-2 ${selectedArticleCode === article.code ? 'text-indigo-900 dark:text-indigo-100' : 'text-gray-900 dark:text-gray-100'}`}>
                                                {article.description}
                                            </span>
                                            <span className="text-xs font-mono font-medium text-gray-500 whitespace-nowrap">
                                                ${article.cost}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-xs text-gray-500 font-mono">
                                                {article.code}
                                            </span>

                                            <Badge
                                                variant={getCategoryVariant(article.category, darkMode)}
                                                className="text-[10px] px-1.5 h-5 rounded"
                                            >
                                                {article.category}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 3. CONFIGURATION FORM */}
                {selectedArticle && (
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-2">

                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium text-sm text-gray-900 dark:text-white">Configure Item</h4>

                            <Badge variant={getCategoryVariant(selectedArticle.category, darkMode)} className="text-[10px]">
                                {selectedArticle.category}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label htmlFor="qty" className={labelClass}>Quantity <span className="text-red-500">*</span></label>
                                <input
                                    id="qty"
                                    type="number"
                                    min="1"
                                    className={inputClass}
                                    placeholder="0"
                                    value={formState.quantity}
                                    onChange={(e) => setFormState({ ...formState, quantity: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="cost" className={labelClass}>Unit Cost</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-gray-500 text-xs">$</span>
                                    <input
                                        id="cost"
                                        type="number"
                                        step="0.01"
                                        className={`${inputClass} pl-6`}
                                        placeholder="0.00"
                                        value={formState.estimatedCost}
                                        onChange={(e) => setFormState({ ...formState, estimatedCost: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="url" className={labelClass}>Link (Optional)</label>
                            <div className="relative">
                                <ExternalLink className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    id="url"
                                    type="text"
                                    className={`${inputClass} pl-9`}
                                    placeholder="https://..."
                                    value={formState.purchaseUrl}
                                    onChange={(e) => setFormState({ ...formState, purchaseUrl: e.target.value })}
                                />
                            </div>
                        </div>

                        <Button
                            variant="primary"
                            className="w-full"
                            onClick={handleSubmit}
                            disabled={!formState.quantity || !formState.estimatedCost}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add ${calculateTotal()}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};