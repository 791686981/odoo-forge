---
title: "Whether the field can be left empty (`False`) or must be set (`True`), as a Python expression"
source_url: "https://docs.odoo.sbggai.top/developer/reference/user_interface/view_architectures/field_attribute_required.html"
---

.. attribute:: required
   :noindex:

   Whether the field can be left empty (`False`) or must be set (`True`), as a Python expression
   that evaluates to a bool.

   .. example::
      ```xml

         <field name="fname_a" required="True"/>
         <field name="fname_b" required="fname_c != 3"/>

   :requirement: Optional
   :type: :ref:`Python expression <reference/view_architectures/python_expression>`
   :default: `False`
